import React from 'react';
import {View} from 'react-native';
import default_styles from '../../theme/default_styles';
import LottieView from 'lottie-react-native';
import { wp } from '../../utils/responsive';

const size = wp(25);

const LoadingView = () => {
    return (
        <View style={[default_styles.flex,default_styles.center]}>
            <LottieView style={{width:size,height:size}} resizeMode="contain" autoPlay loop source={require('../../assets/animation/loadin_circle_white.json')}/>
        </View>
    );
};


export default LoadingView;