import { useLayoutEffect } from "react";
import { Navigation } from "react-native-navigation";

function useComponentDidAppear(ls,comp){
    useLayoutEffect(()=>{
        const subscription = Navigation.events().registerComponentDidAppearListener(({ componentId }) => {
            if(componentId===comp){
                ls();
            };
        });
        return () => subscription.remove();
    },[]);
};


export default useComponentDidAppear;