import { Navigation } from "react-native-navigation"
import colors from "../../theme/colors";
import { chat_screen } from "../constant"


const to_chat = () => {
    Navigation.showModal({
        component:{
            name:chat_screen,
            options:{
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


export {
    to_chat
}