import React,{useRef,useEffect,memo, useMemo} from 'react';
import {View,StyleSheet,BackHandler,Text,Image,TouchableOpacity,Platform} from 'react-native';
import Animated, {  Layout } from 'react-native-reanimated';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { hp, wp } from '../../utils/responsive';
import { Navigation } from 'react-native-navigation';
import fonts from '../../theme/fonts';
import { useSelector,useDispatch } from 'react-redux';
import Switch from 'react-native-ui-lib/switch';
import { change_user_preference } from '../../db/redux/types';
import PanelHeader from './_panel_header';
import { language_picker, topic_picker } from '../../navigations/constant';
import { open_sheet } from '../../navigations/flow/sheet';
import isEqual from 'lodash/isEqual';
import useComponentDidAppear from '../../hooks/useComponentDidAppear';

const snap_points= [hp(20),hp(40), hp(110)];
const option_hitslip = {top:hp(2),bottom:hp(2)}
const animation = Layout.springify().damping(20).mass(1.2);


const setting_fields = [
    {
        id:'autoroll',
        title:'Auto-reroll',
        description:'Automatically find another stranger when chat get disconnected.',
        type:'switch'
    },
    {
        id:'unmoderated',
        title:'Unmoderated section',
        description:'Join the unmonitored section instead. May have explict contents.',
        type:'switch'
    },
    {
        id:'topics',
        title:'Interested topics',
        description:'Adding topics will let you discover people with the same topics.',
        push:topic_picker
    },
    {
        id:'language',
        title:'Preferred language',
        description:'The language in which you prefer to chat. You can update this anytime.',
        style:{borderBottomWidth:0},
        push:language_picker
    }
];

const Settings = ({componentId}) =>{ 
    // creating inner ref to avoid a error in react-native-scroll-bottom-sheet
    const _set_inner_ref_ = ref=> {};
    const _sheet_ref_ = useRef(null);
    const _delta_ = useRef(new Animated.Value(1));

    const user = useSelector(state=>state.app.user);
    const dispatch = useDispatch()


    Platform.OS==='ios'&&useComponentDidAppear(()=>{
        _sheet_ref_&&_sheet_ref_.current.snapTo(0);
    },componentId);


    useEffect(() => {
        // custom backhandler to support dismissing the model after closing the bottomsheet
        const back = () =>  {
            _sheet_ref_&&_sheet_ref_.current.snapTo(2);
            return true;
        }
     
        const back_handler = BackHandler.addEventListener("hardwareBackPress",back);
        return () => back_handler.remove();
    }, []);

    const _on_settle_ = (index) => {
        if(index===2){
            _close_();
          }
    };

    const _on_press_field_ = (id,to)=>{
        open_sheet(to,{selected:user[id]},'_end');
    };

    const _on_change_value_ = (field,value)=>{
        dispatch({type:change_user_preference,payload:{field,value}});
    };

    const _close_ = () => {
        Navigation.dismissModal(componentId);
        return true;
    };

    const _render_handle_ = () => <PanelHeader title={'Settings'}/>

    const _render_fields_ = item => {
        return <Field {...item} key={item.id} value={user[item.id]} onChange={_on_change_value_} onPress={_on_press_field_}/>
    };

    return (
        <View style={[default_styles.flex]}>
            <Animated.View  nativeID="background" style={[styles.background_fill,{opacity: _delta_.current.interpolate({inputRange:[0,1],outputRange:[0,.4]})}]} />
            <Animated.View nativeID="sheet" style={[default_styles.flex]}>
                <ScrollBottomSheet innerRef={_set_inner_ref_} ref={_sheet_ref_} showsVerticalScrollIndicator={false} componentType="ScrollView" snapPoints={snap_points} initialSnapIndex={Platform.select({ios:2,android:0})} onSettle={_on_settle_} animatedPosition={_delta_.current} renderHandle={_render_handle_} contentContainerStyle={styles.content_container}>
                     {setting_fields.map(_render_fields_)}
                </ScrollBottomSheet>
            </Animated.View>
        </View>
    );
};


const are_equal_values = (p,n) => {
    if(typeof n.value==='object'){
        if(n.value&&(typeof n.value.length!=="undefined")){
            if(n.value.length!==p.value.length){
                return false;
            };
            return isEqual(n.value,p.value);
        };
        return p.value.id===n.value.id;
    };
    return p.value===n.value;
}


const Field = memo(({id,title,description,value,type,style,onChange,onPress,push}) => {

    // const [_value_,_change_values_] = type==='switch'&&useState(value)||[];


    const _render_intrests_ = (x) => {
        return (
            <View key={x} style={styles.intrest_tag}>
                <Text style={styles.interest_text}>{x}</Text>
            </View>
        );
    };

    const _render_value_ = () => {
        if(id==='language'){
            return (
                <View style={styles.row_container}>
                        <View>
                            <Text style={styles.language_title}>{value.name}</Text>
                            {value.native_name?<Text style={styles.language_sub_title}>{value.native_name}</Text>:null}
                        </View>
                    <Image resizeMode="contain" style={styles.tick} source={require('../../assets/icons/tick.png')}/>
                </View>
            )
        };
        if(id==='topics'){
            return (
                <View style={styles.interest_container}>
                    {value.map(_render_intrests_)}
                </View>
            )
        };
        return null;
    };

    const _on_press_ = () => {
        if(type==='switch'){
            return onChange&&onChange(id,!value);
        };
        push&&onPress&&onPress(id,push);
        // type==='switch'&&_change_values_(!_value_);
    };
    return (
        <Animated.View layout={animation} style={[styles.field,style]}>
            <TouchableOpacity onPress={_on_press_} hitSlop={option_hitslip}>
                <>
                    <View style={styles.row_aligned_center}>
                        <Text style={styles.title}>{title}</Text>
                        {type==="switch"?<Switch offColor={colors.grey} onValueChange={_on_press_}  onColor={colors.primary} value={value}/>:<Image resizeMode="contain" style={styles.next_icon}  source={require('../../assets/icons/next.png')}/>}
                    </View>
                    <Text style={styles.description}>{description}</Text>
                    {_render_value_()}
                </>
            </TouchableOpacity>
        </Animated.View>
    )
},are_equal_values);


const styles = StyleSheet.create({
    background_fill:{
        ...StyleSheet.absoluteFillObject,
        backgroundColor:colors.black
    },
    intrest_tag:{
        marginRight:wp(2),
        marginTop:wp(2),
        padding:wp(2.9),
        paddingLeft:wp(4.4),
        paddingRight:wp(4.4),
        borderRadius:100,
        justifyContent:'center',
        alignItems:'center',
        minWidth:'20%',
        borderColor:colors.black,
        backgroundColor:colors.black,
    },
    interest_text:{
        fontFamily:fonts.button_title,
        color:colors.white,
        fontSize:wp(3.8)
    },
    content_container: {
        flexGrow:1,
        padding: wp(4),
        paddingTop:wp(8),
        backgroundColor: colors.bg,
        paddingBottom:hp(5),
    },
    interest_container:{
        flexDirection:'row',
        flexWrap:'wrap',
        // marginTop:hp(1)
    },
    title:{
        fontFamily:fonts.title_text,
        color:colors.black,
        fontSize:wp(5),
        lineHeight:wp(5)
    },
    next_icon:{
        width:wp(4.4),
        height:wp(4.4),
        tintColor:colors.text_grey,
    },
    description:{
        marginTop:hp(0.1),
        fontFamily:fonts.text_regular,
        color:colors.text_grey,
        fontSize:wp(3.8),
    },
    row_aligned_center:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    field:{
        borderBottomWidth:hp(.15),
        borderColor:colors.grey,
        paddingBottom:hp(3),
        marginBottom:hp(3)
    },
    divider:{
        width:'100%',
        height:hp(.15),
        backgroundColor:colors.grey,
        marginTop:hp(3.5),
        marginBottom:hp(3.5)
    },
    // language
    row_container:{
        paddingTop:hp(1),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    language_title:{
        fontFamily:fonts.title_text,
        color:colors.primary,
        fontSize:wp(4.5),
        alignSelf:'flex-start'
    },
    tick:{
        width:wp(6),
        height:wp(6),
        tintColor:colors.primary
    },
    language_sub_title:{
        fontFamily:fonts.title_regular,
        color:colors.primary,
        fontSize:wp(4.5),
        alignSelf:'flex-start'
    },
});

export default Settings;