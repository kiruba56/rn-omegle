import { Navigation } from 'react-native-navigation';
import { hp } from '../../utils/responsive';
import { settings_screen } from '../constant';


const interpolation = {type:'accelerateDecelerate'};
const to_settings = (props={}) => {
    Navigation.showModal({
        stack:{
            children:[
                {
                    component:{
                        name:settings_screen,
                        passProps:{...props},
                        options:{
                            modalPresentationStyle:'overCurrentContext',
                            statusBar:{
                                drawBehind:true,
                                backgroundColor:'transparent'
                            },
                            layout:{
                                backgroundColor:'transparent',
                                componentBackgroundColor:'transparent'
                            },
                            animations:{
                                showModal:{
                                    elementTransitions:[
                                        {
                                            id:'background',
                                            alpha:{from:0,to:.26,interpolation}
                                        },
                                        {
                                            id:'sheet',
                                            alpha:{from:0,interpolation},
                                            y:{from:hp(100),to:0,interpolation}
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]
        }
    });
};


export {
    to_settings
}