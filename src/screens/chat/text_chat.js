import React from 'react';
import {View,StyleSheet,BackHandler} from 'react-native';
import { hp, wp } from '../../utils/responsive';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import PanelHeader from '../settings/_panel_header';
import { Navigation } from 'react-native-navigation';

const snap_points= [hp(15),hp(50), hp(110)];

class TextChat extends React.PureComponent{
    constructor(){
        super();
    };

    _set_sheet_ref_ = ref => this._sheet_ = ref;
    _set_sheet_inner_ref_ = ref =>  {};


    _back_ = () =>  {
        this._sheet_&&this._sheet_.snapTo(2);
        return true;
    }

    componentDidMount(){
        this.back_handler = BackHandler.addEventListener("hardwareBackPress",this._back_);
    };

    componentWillUnmount(){
        this.back_handler&&this.back_handler.remove();
    };

    _close_ = () => {
        Navigation.dismissModal(this.props.componentId,{navigationBar:{backgroundColor:colors.dark}});
        return true;
    };


    _on_settle_ = (index) => {
        if(index===2){
            this._close_();
        }
    };

    _render_handle_ = () => <PanelHeader title={'Chat'}/>

    render(){
        return (
            <View style={[default_styles.flex]}>
                <Animated.View nativeID="sheet" style={[default_styles.flex]}>
                     <ScrollBottomSheet  innerRef={this._set_sheet_inner_ref_} ref={this._set_sheet_ref_} showsVerticalScrollIndicator={false} componentType="ScrollView" snapPoints={snap_points} initialSnapIndex={1} onSettle={this._on_settle_} renderHandle={this._render_handle_} contentContainerStyle={styles.content_container}>
                     </ScrollBottomSheet>
                </Animated.View>
            </View>
        );
    };
};

const styles = StyleSheet.create({

    content_container: {
        flexGrow:1,
        padding: wp(4),
        paddingTop:wp(8),
        backgroundColor: colors.bg,
        paddingBottom:hp(5),
    },
});

export default TextChat;

