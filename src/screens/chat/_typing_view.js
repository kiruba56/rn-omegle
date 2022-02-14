import React from 'react';
import {View,StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import { hp, wp } from '../../utils/responsive';
import colors from '../../theme/colors';

const size = wp(10);

const TypingView = ({style}) => {
    return  (
        <View style={style||styles.container}>
            <LottieView style={{width:size,height:size}} resizeMode="contain" autoPlay loop source={require('../../assets/animation/chat_indicator.json')}/>
        </View>

    )
};


const styles = StyleSheet.create({
    container:{
        backgroundColor:colors.white,
        borderRadius:100,
        margin:wp(5),
        paddingLeft:wp(.5),
        paddingRight:wp(.5),
        height:hp(4),
        justifyContent:'center',
        alignItems:'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    }
})

export default TypingView;