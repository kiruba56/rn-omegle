import React from 'react';
import {Pressable} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle,withSpring } from 'react-native-reanimated';
import { hp, wp } from '../utils/responsive';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const default_hitslop = {top:hp(2),bottom:hp(2),left:wp(5),right:wp(5)}

const Bouncy = ({children,onPress,hitSlop=default_hitslop,style={}}) => {
    const offset = useSharedValue(1);

    const animated_styles = useAnimatedStyle(() => {
        return {
          transform: [{ scale: offset.value}],
        };
    });

    


    const on_in = () =>  {
        offset.value = withSpring(0.95,{
            damping:2,
            mass:1,
            stiffness:100
        });
    }
    const on_out = () => {
        offset.value = withSpring(1,{
            damping:2,
            mass:1,
            stiffness:100
        });
    }
 
   return(
    <AnimatedPressable hitSlop={hitSlop} onPressIn={on_in} onPress={onPress}  onPressOut={on_out} style={[animated_styles,style]}>
        {children}
    </AnimatedPressable>
   );
};


export default React.memo(Bouncy);
