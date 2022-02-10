import 'react-native-gesture-handler';
import React from 'react';
import {Text,LogBox} from 'react-native'
import { Navigation } from 'react-native-navigation';
import root from './src/navigations/root';
import {persistStore} from 'redux-persist';
import { Provider } from 'react-redux';
import configure_store from './src/db/redux/config_store';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';


import { home_screen, settings_screen } from './src/navigations/constant';

Navigation.registerComponent(home_screen, () => wrapper(require('./src/screens/home').default));



// LogBox.ignoreAllLogs();

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;


const store = configure_store();


Navigation.events().registerAppLaunchedListener(() => {
 persistStore(store,null,()=>{
       root();
  });
});


Navigation.setLazyComponentRegistrator((componentName) => {
    if(componentName===settings_screen){
        Navigation.registerComponent(settings_screen,()=>gestureHandlerRootHOC(wrapper(require('./src/screens/settings').default)));
    };
});


function wrapper(Component, extra){
  return function inject(props) {
    const _comp = () => (
      <Provider store={store}>
        <Component
          {...props} {...extra}
        />
      </Provider>
    );
    return <_comp />;
  };
};