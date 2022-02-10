import React from 'react';
import {View,StyleSheet,Text} from 'react-native';
import colors from '../../theme/colors';
import fonts from '../../theme/fonts';
import { hp, wp } from '../../utils/responsive';

const PanelHader = ({title}) => {
   return (
        <View  style={styles.header}>
            <View style={styles.panel_handle} />
            <Text style={styles.screen_title}>{title}</Text>
        </View>
   )
};


const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.bg,
        paddingVertical: hp(1),
        borderTopLeftRadius: wp(5.5),
        borderTopRightRadius: wp(5.5),
        elevation:1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth:hp(.15),
        borderColor:colors.grey
    },
    panel_handle: {
        width: wp(10),
        height: hp(.4),
        marginBottom:hp(1),
        backgroundColor: `${colors.text_grey}40`,
        borderRadius: 4
    },
    screen_title:{
        fontFamily:fonts.title_text,
        color:colors.black,
        fontSize:wp(4),
        lineHeight:wp(4)
    },  
   
});

export default PanelHader;