import React, { useEffect, useRef, useState,memo } from 'react';
import {View,StyleSheet,BackHandler,TouchableOpacity,Text,Platform} from 'react-native';
import default_styles from '../../theme/default_styles';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { hp, wp } from '../../utils/responsive';
import Animated from 'react-native-reanimated';
import { Navigation } from 'react-native-navigation';
import PanelHeader from './_panel_header';
import colors from '../../theme/colors';
import fonts from '../../theme/fonts';
import Bouncy from '../../components/bouncy';
import { useDispatch } from 'react-redux';
import { change_user_preference } from '../../db/redux/types';
import useComponentDidAppear from '../../hooks/useComponentDidAppear';

const snap_points= [hp(10),hp(110)];

/*
    TODO: Add more and real topics.
*/
const topics = ['Travel','Make Friends','Movies','Music','Reading','Art','Singing','Love','Tech','Anime','Pizza','1234TESTME'];


const TopicPicker = ({componentId,selected=[]}) => {

    const [selected_topics,_set_selected_state_] = useState(selected);

    const dispatch = useDispatch();

    const _on_press_ = (title) => {
        if(selected_topics.includes(title)){
            return _set_selected_state_(arr=>arr.filter(item=>item!==title));
        };
        _set_selected_state_(arr=>[...arr,title]);

    };


    // creating inner ref to avoid a error in react-native-scroll-bottom-sheet
    const _set_inner_ref_ = ref=> {};
    const _sheet_ref_ = useRef(null);
    const _delta_ = useRef(new Animated.Value(0));

    const back = () =>  {
        _sheet_ref_&&_sheet_ref_.current.snapTo(1);
        return true;
    };

    Platform.OS==='ios'&&useComponentDidAppear(()=>{
        _sheet_ref_&&_sheet_ref_.current.snapTo(0);
    },componentId);


    useEffect(() => {
        // custom backhandler to support dismissing the model after closing the bottomsheet
        
        const back_handler = BackHandler.addEventListener("hardwareBackPress",back);
        return () => back_handler.remove();
    }, []);

    const _on_settle_ = (index) => {
        if(index===1){
            _close_();
          }
    };

    const _render_handle_ = () => <PanelHeader title={'Interested topics'}/>;

    const _close_ = () => {
        Navigation.dismissModal(componentId);
        return true;
    };

    const _render_topics_ = (item) => <Topic title={item} key={item} selected={selected_topics.includes(item)} onPress={_on_press_}/>;

    const _done_ = () => {
        dispatch({type:change_user_preference,payload:{field:'topics',value:selected_topics}});
        back();
    };


    return (
        <View style={[default_styles.flex]}>
            <Animated.View nativeID="background_end" style={[styles.background_fill,{opacity: _delta_.current.interpolate({inputRange:[0,1],outputRange:[0,.4]})}]} />
            <Animated.View nativeID="sheet_end" style={[default_styles.flex]}>
                <ScrollBottomSheet innerRef={_set_inner_ref_} ref={_sheet_ref_} showsVerticalScrollIndicator={false} componentType="ScrollView" snapPoints={snap_points} initialSnapIndex={Platform.select({ios:1,android:0})} onSettle={_on_settle_} animatedPosition={_delta_.current} renderHandle={_render_handle_} contentContainerStyle={styles.content_container}>
                    {topics.map(_render_topics_)}
                  
                </ScrollBottomSheet>
                <View style={styles.btn_cover}>
                    <Bouncy onPress={_done_}>
                        <View style={styles.btn}>
                                <Text style={styles.btn_text}>Done</Text>
                        </View>
                    </Bouncy>
                </View>
            </Animated.View>
        </View>
    )
};  


const are_equal = (p,n) => {
    return Boolean(p.selected===n.selected);
}

const Topic = memo(({title,selected,onPress}) => {

    const _on_press_ = () => {  
        onPress&&onPress(title);
    }
    return (
        <TouchableOpacity onPress={_on_press_}  style={[styles.tag,selected?styles.tag_selected:{}]}>
                <Text style={[styles.text,selected?styles.text_selected:{}]}>{title}</Text>
        </TouchableOpacity>
    )
},are_equal);


const styles = StyleSheet.create({
    background_fill:{
        ...StyleSheet.absoluteFillObject,
        backgroundColor:colors.black
    },
    content_container: {
        flexGrow:1,
        padding: wp(4),
        paddingTop:wp(8),
        backgroundColor: colors.bg,
        paddingBottom:hp(5),
        flexDirection:'row',
        flexWrap:'wrap'
    },
    tag_selected:{
        backgroundColor:colors.black,
        borderColor:colors.black,
        borderWidth:0,
        padding:wp(2.9),
        paddingLeft:wp(4.4),
        paddingRight:wp(4.4),
    },  
    text_selected:{
        color:colors.white
    },
    btn_text:{
        fontFamily:fonts.title_text,
        color:colors.white,
        fontSize:wp(5)
    },  
    btn_cover:{
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        margin: wp(5),
    },
    btn:{
        backgroundColor:colors.black,
        padding:wp(5),
        paddingTop:wp(3.5),
        paddingBottom:wp(3.5),
        borderRadius:100,
        justifyContent:'center',
        alignItems:'center' 
    },
    tag:{
        borderWidth:wp(.4),
        marginRight:wp(2),
        marginBottom:wp(2),
        padding:wp(2.5),
        paddingLeft:wp(4),
        paddingRight:wp(4),
        borderRadius:100,
        justifyContent:'center',
        alignItems:'center',
        minWidth:'20%',
        borderColor:colors.text_grey
    },
    text:{
        fontFamily:fonts.button_title,
        color:colors.text_grey,
        fontSize:wp(3.8)
    },
});


export default TopicPicker;