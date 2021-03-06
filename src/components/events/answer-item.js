import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

import './styles.scss';

/**
 * User response to a question.
 */
class AnswerItem extends React.Component {
  /**
   * Render component.
   * @returns {XML}
   */
  render () {
    return (
      <div className={'event card answer'} id={this.props.data.uuid}>
        <div className={'header'}>
          <div className={'author'}>{this.props.data.user}</div>
          <div className={'date'}>{moment(this.props.data.date).format('MMM DD')}</div>
        </div>
        <p>{this.props.data.message}</p>
      </div>
    );
  }
}

AnswerItem.propTypes = {
  data: PropTypes.object
};

export default AnswerItem;
