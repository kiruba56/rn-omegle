import { Navigation } from "react-native-navigation";
import { home_screen } from "./constant";
import defaults from "./defaults";



export default () => {
    defaults();
    Navigation.setRoot({
        root:{
            stack:{
                children:[
                    {
                        component:{
                            name:home_screen
                        }
                    }
                ]
            }
        }
    })
};