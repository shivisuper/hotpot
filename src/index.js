import App from './components/app';
import ReactHabitat from 'react-habitat';

class HabitatApp extends ReactHabitat.Bootstrapper {
  constructor () {
    super();
    const containerBuilder = new ReactHabitat.ContainerBuilder();
    containerBuilder.register(App).as('Hotpot');
    this.setContainer(containerBuilder.build());
  }
}

const instance = new HabitatApp();

window.updateHabitat = instance.update.bind(instance);

export default instance;
