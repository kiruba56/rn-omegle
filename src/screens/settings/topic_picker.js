import React, { useEffect, useRef } from 'react';
import {View,StyleSheet,BackHandler} from 'react-native';
import default_styles from '../../theme/default_styles';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import { hp, wp } from '../../utils/responsive';
import Animated from 'react-native-reanimated';
import { Navigation } from 'react-native-navigation';
import PanelHeader from './_panel_header';
import colors from '../../theme/colors';

const snap_points= [hp(10),hp(110)];

const TopicPicker = ({componentId}) => {
    // creating inner ref to avoid a error in react-native-scroll-bottom-sheet
    const _set_inner_ref_ = ref=> {};
    const _sheet_ref_ = useRef(null);
    const _delta_ = new Animated.Value(1);

    useEffect(() => {
        // custom backhandler to support dismissing the model after closing the bottomsheet
        const back = () =>  {
            _sheet_ref_&&_sheet_ref_.current.snapTo(1);
            return true;
        }
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



    return (
        <View style={[default_styles.flex]}>
            <Animated.View nativeID="background_end" style={[styles.background_fill,{opacity: _delta_.interpolate({inputRange:[0,1],outputRange:[0,.4]})}]} />
            <Animated.View nativeID="sheet_end" style={[default_styles.flex]}>
                <ScrollBottomSheet innerRef={_set_inner_ref_} ref={_sheet_ref_} showsVerticalScrollIndicator={false} componentType="ScrollView" snapPoints={snap_points} initialSnapIndex={0} onSettle={_on_settle_} animatedPosition={_delta_} renderHandle={_render_handle_} contentContainerStyle={styles.content_container}>
                </ScrollBottomSheet>
            </Animated.View>
        </View>
    )
};  


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
    },
});


export default TopicPicker;