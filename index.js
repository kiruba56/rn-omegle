import 'react-native-gesture-handler';
import React from 'react';
import {Text,LogBox} from 'react-native'
import { Navigation } from 'react-native-navigation';
import root from './src/navigations/root';
import {persistStore} from 'redux-persist';
import { Provider } from 'react-redux';
import configure_store from './src/db/redux/config_store';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';


import { home_screen, language_picker, settings_screen, topic_picker } from './src/navigations/constant';

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
    }else if(componentName===language_picker){
        Navigation.registerComponent(language_picker,()=>gestureHandlerRootHOC(wrapper(require('./src/screens/settings/language_picker').default)));
    }else if(componentName===topic_picker){
      Navigation.registerComponent(topic_picker,()=>gestureHandlerRootHOC(wrapper(require('./src/screens/settings/topic_picker').default)));
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