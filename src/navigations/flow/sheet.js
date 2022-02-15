import { Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import colors from '../../theme/colors';
import { hp } from '../../utils/responsive';


const interpolation = {type:'accelerateDecelerate'};

// prefix to avoid animating previous screen in the stack
const open_sheet = (name,props={},prefix='') => {
    Navigation.showModal({
        component:{
            name,
            id:`${name}.id`,
            passProps:{...props},
            options:{
                modalPresentationStyle:'overCurrentContext',
                statusBar:{
                    drawBehind:true,
                    backgroundColor:'transparent'
                },
                layout:{
                    backgroundColor:colors.bg,
                    componentBackgroundColor:'transparent'
                },
                navigationBar:{
                    backgroundColor:colors.bg
                },
                animations:{
                    showModal:Platform.OS==='ios'?undefined:{
                        elementTransitions:[
                            {
                                id:'background'+prefix,
                                alpha:{from:0,to:.26,interpolation}
                            },
                            {
                                id:'sheet'+prefix,
                                alpha:{from:0,interpolation},
                                y:{from:hp(100),to:0,interpolation},
                                
                            }
                        ],
                    }
                }
            }
      }
    });
};


export {
    open_sheet
}