import React,{memo, useEffect,useRef} from 'react';
import {View,StyleSheet,BackHandler,Text,Image,Platform,TouchableOpacity as RN_TOUCHABLE} from 'react-native';
import Animated from 'react-native-reanimated';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { hp, wp } from '../../utils/responsive';
import PanelHeader from './_panel_header';
import { Navigation } from 'react-native-navigation';
import languages from '../../utils/language_list.json';
import fonts from '../../theme/fonts';
import {TouchableOpacity as RNGH_TOUCHABLE} from 'react-native-gesture-handler';
import { useDispatch } from 'react-redux';
import { change_user_preference } from '../../db/redux/types';
import useComponentDidAppear from '../../hooks/useComponentDidAppear';

const snap_points= [hp(10),hp(110)];
const item_height = wp(17);

const Touchable = Platform.OS==='ios'?RN_TOUCHABLE:RNGH_TOUCHABLE;

const LanguagePicker = ({componentId,selected={id:'en'}}) => {
  // creating inner ref to avoid a error in react-native-scroll-bottom-sheet
    const _set_inner_ref_ = ref=> {};
    const _sheet_ref_ = useRef(null);
    const _delta_ = useRef(new Animated.Value(Platform.OS==='android'));

    const dispatch = useDispatch();

    Platform.OS==='ios'&&useComponentDidAppear(()=>{
        _sheet_ref_&&_sheet_ref_.current.snapTo(0);
    },componentId);

    useEffect(() => {
        // custom backhandler to support dismissing the model after closing the bottomsheet
        const back = () =>  {
            _sheet_ref_&&_sheet_ref_.current.snapTo(1);
            return true;
        }
        const back_handler = BackHandler.addEventListener("hardwareBackPress",back);
        return () => back_handler.remove();
    }, []);


    const _render_handle_ = () => <PanelHeader title={'Preferred language'}/>;

    const _on_settle_ = (index) => {
        if(index===1){
            _close_();
          }
    };

    const _close_ = () => {
        Navigation.dismissModal(componentId);
        return true;
    };


    const _key_ = item => item.id;

    // const _render_header_ = () => {
    //     return (
    //         <View style={styles.search_container}>
    //                 <Image resizeMode="contain" style={styles.search_icon} source={require('../../assets/icons/search.png')}/>
    //                 <TextInput placeholder="Search" onChangeText={_search_} style={styles.search_input}/>
    //         </View>
    //     )
    // };  

    const _on_item_press_ = (value={id:'en',name:'English'}) => {
        requestAnimationFrame(()=>{
            if(value.id!==selected.id){
                dispatch({type:change_user_preference,payload:{field:'language',value}});
            };
            _close_();
        });
    };  

    const _render_item_ = ({item}) => {
        return <Language {...item} selected={selected.id===item.id} onPress={_on_item_press_}/>;
    };
    const _get_item_layout_ = (data, index) => {
            return {
                length: item_height, offset: item_height * index, index    
            }
    };   
    return (
        <View nativeID='cover' style={[default_styles.flex]}>
              <Animated.View nativeID="background_end" style={[styles.background_fill,{opacity: _delta_.current.interpolate({inputRange:[0,1],outputRange:[0,.4]})}]} />
              <View nativeID='sheet_end' style={default_styles.flex}>
                <ScrollBottomSheet
                    innerRef={_set_inner_ref_}
                    ref={_sheet_ref_}
                    componentType="FlatList"
                    snapPoints={snap_points}
                    initialSnapIndex={Platform.select({ios:1,android:0})}
                    onSettle={_on_settle_}
                    animatedPosition={_delta_.current}
                    renderHandle={_render_handle_}
                    contentContainerStyle={styles.content_container} 
                    data={languages}    
                    keyExtractor={_key_}
                    initialNumToRender={10}
                    renderItem={_render_item_}
                    getItemLayout={_get_item_layout_}
                />
    
            </View>
        </View>
    );
};

const Language = memo(({id,selected,name,native_name,onPress}) => {
    const _on_press_ = () => {
        onPress&&onPress({id,name})
    };
    return (
        <Touchable onPress={_on_press_} style={styles.row_container}>
            <View>
                <Text style={[styles.title,selected?styles.selected_effect:{}]}>{name}</Text>
                {native_name?<Text style={[styles.sub_title,selected?styles.selected_effect:{}]}>{native_name}</Text>:null}
            </View>
            {selected?<Image resizeMode="contain" style={styles.tick} source={require('../../assets/icons/tick.png')}/>:null}
        </Touchable>
    )
},()=>true);

const styles = StyleSheet.create({
    background_fill:{
        ...StyleSheet.absoluteFillObject,
        backgroundColor:colors.black
    },
    content_container: {
        flexGrow:1,
        padding: wp(4),
        backgroundColor: colors.bg,
        paddingBottom:hp(5),
    },
    tick:{
        width:wp(6),
        height:wp(6),
        tintColor:colors.primary
    },
    search_container:{
        backgroundColor:colors.grey,
        width:'100%',
        padding:wp(3.5),
        paddingBottom:wp(2.2),
        paddingTop:wp(2.2),
        borderRadius:wp(2),
        alignItems:'center',
        flexDirection:'row'
    },
    search_icon:{
        width:wp(4.5),
        height:wp(4.5),
        tintColor:colors.text_grey
    },
    search_input:{
        padding:0,
        marginLeft:wp(2),
        flex:1,
        fontFamily:fonts.title_regular,
        color:colors.black,
        fontSize:wp(4.3)
    },
    selected_effect:{
        color:colors.primary
    },  
    row_container:{
        borderBottomWidth:hp(.12),
        borderColor:`${colors.grey}90`,
        // paddingTop:hp(2),
        // paddingBottom:hp(2),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        height:item_height
    },
    sub_title:{
        fontFamily:fonts.title_regular,
        color:colors.text_grey,
        fontSize:wp(4.5),
        alignSelf:'flex-start'
    },
    title:{
        fontFamily:fonts.title_text,
        color:colors.black,
        fontSize:wp(4.5),
        alignSelf:'flex-start'
    }
});

export default LanguagePicker;