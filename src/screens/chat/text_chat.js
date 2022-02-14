import React, { useEffect, useRef } from 'react';
import {View,StyleSheet,BackHandler,TextInput,Text,TouchableOpacity} from 'react-native';
import { hp, wp } from '../../utils/responsive';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import PanelHeader from '../settings/_panel_header';
import { Navigation } from 'react-native-navigation';
import fonts from '../../theme/fonts';
import TypingView from './_typing_view';

const snap_points= [hp(15),hp(50), hp(110)];


class TextChat extends React.PureComponent{
    constructor(){
        super();
        this._current_index_ = 1;
        this.state = {
            _can_send:false
        };
        this._text_ = null;
    };

    _set_sheet_ref_ = ref => this._sheet_ = ref;
    _set_input_ref_ = ref => this._input_ = ref;
    _set_sheet_inner_ref_ = ref =>  {};

    _on_change_text_ = t => {
        this._text_ = t;
        if( (!this._text_||(this._text_&&this._text_.length===0)) && this.state._can_send ){
            return this.setState({_can_send:false});
        };
        if(!this.state._can_send&&this._text_&&this._text_.length>0){
            return this.setState({_can_send:true});
        };
    };

    _back_ = () =>  {
        this._sheet_&&this._sheet_.snapTo(2);
        return true;
    }

    _on_focus_ = () => {
        if(this._current_index_!==0){
             this._sheet_&&this._sheet_.snapTo(0);
        };
    };  


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
        this._current_index_ = index;
        if(index===2){
            this._close_();
        };
    };

    _render_chats_ = ({item}) => {
        return null;
    };

    _render_footer_ = () => <View style={styles.footer}/>

    _key_ = item => `${item.id}`;

    _render_handle_ = () => <PanelHeader title={'Chat'}/>

    _on_send_ = () => {
        this._input_&&this._input_.clear();
        this._text_ = null;
        this.setState({_can_send:false});
    };

    render(){
        return (
            <View style={[default_styles.flex]}>
                <Animated.View nativeID="sheet" style={[default_styles.flex,styles.align_end]}>
                     <ScrollBottomSheet
                        innerRef={this._set_sheet_inner_ref_}
                        ref={this._set_sheet_ref_}
                        componentType="FlatList"
                        snapPoints={snap_points}
                        data={[{id:'1232'},{id:'123123123'},{id:'3'}]}
                        renderItem={this._render_chats_}
                        ListFooterComponent={this._render_footer_}
                        keyExtractor={this._key_}
                        initialSnapIndex={1}
                        onSettle={this._on_settle_}
                        renderHandle={this._render_handle_}
                        style={[default_styles.flex]}
                        contentContainerStyle={styles.content_container} 
                        />

                        <View style={styles.footer_container}>
                             <TextInput ref={this._set_input_ref_} onChangeText={this._on_change_text_} multiline maxLength={100} placeholder="Enter message" onFocus={this._on_focus_} style={styles.text_input}/>
                             {this.state._can_send&&
                                <Animated.View entering={FadeIn} exiting={FadeOut}>
                                    <TouchableOpacity onPress={this._on_send_}>
                                        <Text style={styles.send}>Send</Text>
                                    </TouchableOpacity>
                                </Animated.View>}
                        </View>

                </Animated.View>
            </View>
        );
    };
};

const styles = StyleSheet.create({
    footer:{
        height:hp(10)
    },
    content_container: {
        flexGrow:1,
        padding: wp(5),
        backgroundColor: colors.bg,
    },
    align_end:{
        justifyContent:'flex-end'
    },  
    footer_container:{
        padding:wp(5),
        paddingTop:wp(2.5),
        paddingBottom:wp(2.5),
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        borderTopWidth:hp(.15),
        borderColor:colors.grey,
        backgroundColor:colors.bg
    },  
    text_input:{
        padding:0,
        fontFamily:fonts.title_regular,
        color:colors.black,
        fontSize:wp(4.5),
        flex:1,
        maxHeight:hp(10)
    },
    send:{
        marginLeft:wp(2.5),
        color:'#0097e6',
        fontFamily:fonts.title_text,
        fontSize:wp(4.5)
    }
});

export default TextChat;

