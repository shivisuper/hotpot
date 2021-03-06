const config = require('config');
const data = require('./data');
const http = require('http');
const Message = require('../../models/message');
const moment = require('moment');
// const path = require('path');
const pino = require('pino')();
const Promise = require('bluebird');
const socketio = require('socket.io');
// const { spawn } = require('child_process');

// get the release version number
// let p = path.join(process.cwd(), 'package.json');
// const pkg = require(p);
const URL_BASE = config.get('URL_BASE');

var CHANNELS = {
  ACTIVITY: 'activity',
  EVENTS: 'events',
  INTENT: 'intent'
};

// application module state
var context = {
  app: null,
  io: null
};

/**
 * Get client, channel configuration.
 * @param {Request} req Request
 * @param {Response} res Response
 */
function getClientConfiguration (req, res) {
  // TODO send client configuration
  let features = config.get('FEATURES');
  res.send({features: features});
}

/**
 * Get events in chronological order.
 * @param {Request} req Request
 * @param {Response} res Response
 */
function getEvents (req, res) {
  data
    .getEventsInOrder()
    .then(events => {
      res.send(events);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

/**
 * Handle socket connection.
 * @param {Socket} socket Websocket connection
 */
function onConnection (socket) {
  pino.info(`user connected ${socket.client.id}`);
  socket.on('activity', onChannelActivity);
  socket.on('disconnect', onChannelDisconnect);
  socket.on('discussion', onChannelMessage);
}

/**
 * Handle channel activity.
 * @param data
 */
function onChannelActivity (data) {
  pino.info(`channel activity ${data}`);
}

/**
 * Handle user disconnect event.
 * @param data
 */
function onChannelDisconnect (data) {
  pino.info(`user disconnected: ${data}`);
}

/**
 * Handle channel message.
 * @param {Object} data Message
 */
function onChannelMessage (data) {
  let m = new Message({
    user: data.user || 'anonymous',
    date: moment().toISOString(),
    fullName: data.fullName || data.fullname || 'N/A',
    message: data.message,
    parent: null,
    url: data.url,
    email: data.email
  });
  m.save((err, doc) => {
    if (err) {
      pino.error(err);
    } else {
      pino.info(`Saved message ${doc.uuid} from ${m.fullName} <${m.email}>`);
      context.io.of(URL_BASE).emit(CHANNELS.EVENTS, doc);
      context.app.emit('discussion:message', doc);
    }
  });
}

/**
 * Register module.
 * @param {Object} ctx Application context
 */
function register (ctx) {
  pino.info('Registering event service');
  context.app = ctx.app;

  ctx.app.get(`${URL_BASE}/api/config`, getClientConfiguration);
  ctx.app.get(`${URL_BASE}/api/events`, getEvents);
  context.server = http.Server(context.app);
  ctx.server = context.server; // WARNING side effect!!!
}

/**
 * Start application module.
 */
function start () {
  pino.info('Starting event service');
  // let socket.io connect to /hotpot/socket.io path on the server
  context.io = socketio(context.server, { path: `${URL_BASE}/socket.io` });
  context.io.of(URL_BASE).on('connection', onConnection);
  return Promise.resolve();
}

/**
 * Stop application module.
 * @returns
 */
function stop () {
  pino.info('Stopping event service');
  return Promise.resolve();
}

module.exports = {
  register: register,
  start: start,
  stop: stop
};
