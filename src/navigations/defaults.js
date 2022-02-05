import { Navigation } from "react-native-navigation";
import colors from "../theme/colors";



export default () => {
    Navigation.setDefaultOptions({
        topBar:{
            visible:false,
            drawBehind:true
        },
        layout:{
            backgroundColor:colors.bg,
            componentBackgroundColor:colors.bg,
        },
        statusBar:{
            backgroundColor:colors.bg,
            style:'dark',
        },
        navigationBar:{
            backgroundColor:colors.bg
        }
    })
};  
