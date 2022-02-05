import { StyleSheet } from 'react-native';
import { wp } from '../utils/responsive';
import colors from './colors';
import fonts from './fonts';

export default StyleSheet.create({
    flex: {
        flex:1
    },
    cover:{
        flex:1,
        padding:wp(5)  
    },
    center:{
        justifyContent: 'center',
        alignItems:'center'
    },
    align_between:{
        flex:1,
        justifyContent:'space-between',
    },
    button_text:{
        color:colors.white,
        fontFamily:fonts.button_title,
        fontSize:wp(4.8)
    }
});