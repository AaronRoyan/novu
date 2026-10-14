import { registerRootComponent } from 'expo';

// Defines the background location task. It has to exist before anything else
// runs, so iOS can hand location updates to it even when the app is in the background.
import './lib/locationTask';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
