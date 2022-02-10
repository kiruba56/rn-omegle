import React from 'react';
import {View,Text,StyleSheet,Image} from 'react-native';
import Bouncy from '../../components/bouncy';
import { to_settings } from '../../navigations/flow/settings';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import fonts from '../../theme/fonts';
import { hp, wp } from '../../utils/responsive';


const Home = () => {
    return (
        <View style={[default_styles.flex]}>
            <View style={[default_styles.flex,default_styles.center]}>
                    <View style={styles.welcome_container}>
                            <Text style={styles.title}>Hi, Kiruba </Text>
                            <Image source={require('../../assets/icons/wave.png')} resizeMode="contain" style={styles.wave}/>
                    </View> 
                    <Text style={styles.sub_title}>Tap to start a conversation</Text>
            </View>
            <Bouncy onPress={to_settings} style={styles.settings_container}>
                <Image resizeMode="contain" style={styles.settings} source={require('../../assets/icons/cog.png')}/>
            </Bouncy>
        </View>
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