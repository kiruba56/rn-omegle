import { Navigation } from "react-native-navigation"
import colors from "../../theme/colors";
import { chat_screen } from "../constant"

const animation_enter = {from:1.5,to:1,interpolation:{type:'linear'}};
const animation_exit = {from:1,to:1.5,interpolation:{type:'linear'}};
const to_chat = () => {
    Navigation.showModal({
        component:{
            name:chat_screen,
            options:{
                animations:{
                    showModal:{
                        waitForRender:true,
                        scaleX:animation_enter,
                        scaleY:animation_enter
                    }
                },
                statusBar:{
                    drawBehind:true,
                    backgroundColor:'transparent',
                    style:'light',
                    animated:true
                },
                layout:{
                    backgroundColor:colors.dark,
                    componentBackgroundColor:colors.dark
                },
                navigationBar:{
                    backgroundColor:colors.dark
                }
            }
        }
    })
};

const dismiss_chat = (id) => {
    Navigation.dismissModal(id,{
        animations:{
            dismissModal:{
                waitForRender:true,
                scaleX:animation_exit,
                scaleY:animation_exit,
                alpha:{to:0,interpolation:{type:'linear'}}
            }
        }
    })
};


export {
    to_chat,
    dismiss_chat
}