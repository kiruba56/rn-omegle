import React from 'react';
import {View,Text,StyleSheet,Image,TouchableWithoutFeedback} from 'react-native';
import Bouncy from '../../components/bouncy';
import { open_sheet } from '../../navigations/flow/sheet';
import { to_chat } from '../../navigations/flow/chat';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import fonts from '../../theme/fonts';
import { hp, wp } from '../../utils/responsive';
import { settings_screen } from '../../navigations/constant';

const Home = ({componentId}) => {

    const _on_settings_ = () => open_sheet(settings_screen);

    const _on_press_ = () => {
        to_chat();
    };  

    return (
        <TouchableWithoutFeedback style={default_styles.flex} onPress={_on_press_}>
            <View style={[default_styles.flex]}>
                <View style={[default_styles.flex,default_styles.center]}>
                        <View style={styles.welcome_container}>
                                <Text style={styles.title}>Hey </Text>
                                <Image source={require('../../assets/icons/wave.png')} resizeMode="contain" style={styles.wave}/>
                        </View> 
                        <Text style={styles.sub_title}>Tap to start a conversation</Text>
                </View>
                <Bouncy onPress={_on_settings_} style={styles.settings_container}>
                    <Image resizeMode="contain" style={styles.settings} source={require('../../assets/icons/cog.png')}/>
                </Bouncy>
            </View>
        </TouchableWithoutFeedback>
    );
};


export default Home;


const styles = StyleSheet.create({
    welcome_container:{
        flexDirection:'row',
        justifyContent:'center'
    },
    settings_container:{
        padding:wp(3),
        backgroundColor:colors.grey,
        borderRadius:100,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'flex-start',
        bottom:0,
        margin:wp(5),
        marginTop:0
    },
    settings:{
        width:wp(7),
        height:wp(7),
        tintColor:colors.black
    },
    title:{
        fontFamily:fonts.title_text,
        color:colors.black,
        fontSize:wp(10),
        textAlign:'center'
    },
    sub_title:{
        marginTop:hp(.2),
        fontSize:wp(6),
        color:colors.black,
        fontFamily:fonts.title_regular,
        textAlign:'center'
    },
    wave:{
        width:wp(11),
        height:wp(11),
    },
});