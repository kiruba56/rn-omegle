import React, { memo } from 'react';
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
import trimEnd from 'lodash/trimEnd';

const snap_points= [hp(15),hp(50), hp(110)];


class TextChat extends React.PureComponent{
    constructor(props){
        super(props);
        this._current_index_ = 1;
        this.state = {
            _can_send:false,
            // _data:[
            //     {id:'1232',text:'Hello',by:'stranger',time:'11:10'},
            //     {id:'esad',text:'Hey',by:'me',time:'11:20'}
            // ]
        };
        this._text_ = null;
        this._is_user_typing_ = false;
        Navigation.events().bindComponent(this);
    };


    componentDidAppear(){
        this._sheet_inner_&&this._sheet_inner_.scrollToEnd();
    };  

    _set_sheet_ref_ = ref => this._sheet_ = ref;
    _set_input_ref_ = ref => this._input_ = ref;
    _set_sheet_inner_ref_ = ref =>  this._sheet_inner_ = ref;

    _on_end_editing_ = () =>{
        if(this._is_user_typing_){
            this.toggle_typing(false);
            this._is_user_typing_ = false;
        };
    };

    toggle_typing = to => this.props.toggle_typing&&this.props.toggle_typing(to);

    _on_change_text_ = t => {
        this._text_ = t;
        if(!this._is_user_typing_){
            this.toggle_typing(true);
             this._is_user_typing_ = true;
        };
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
        if(this._is_user_typing_){
            this.toggle_typing(false);
        };
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
        return <Chat {...item} />;
    };

    _render_footer_ = () => (
        <Animated.View style={styles.footer}>
           {this.props._is_stranger_typing&&
           <Animated.View  entering={FadeIn} exiting={FadeOut}>
                <TypingView style={styles.typing_view}/>
            </Animated.View>}
        </Animated.View>
    )

    _key_ = item => `${item.id}`;

    _render_handle_ = () => <PanelHeader title={'Chat'}/>

    _on_send_ = () => {
        requestAnimationFrame(()=>{
            if(this._is_user_typing_){
                this.toggle_typing(false);
                this._is_user_typing_ = false;
            };
            const _text = trimEnd(this._text_);
            this.props.send&&this.props.send(_text);
            this.setState(prv=>{
                return{
                    _can_send:false,
                }
            });
            this._input_&&this._input_.clear();
            this._text_ = null;
        });
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
                        data={this.props._data}
                        renderItem={this._render_chats_}
                        ListFooterComponent={this._render_footer_}
                        keyExtractor={this._key_}
                        initialSnapIndex={0}
                        onSettle={this._on_settle_}
                        renderHandle={this._render_handle_}
                        initialNumToRender={10}
                        style={[default_styles.flex]}
                        contentContainerStyle={styles.content_container} 
                        />

                        <View style={styles.footer_container}>
                             <TextInput ref={this._set_input_ref_} onEndEditing={this._on_end_editing_} onChangeText={this._on_change_text_} multiline maxLength={100} placeholder="Enter message" onFocus={this._on_focus_} style={styles.text_input}/>
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


const Chat = memo(({by="me",text,time})=>{

    const style = {cover:by==='me'?styles.chat_me:styles.chat_stranger,text:by==='me'?styles.chat_text_me:{},time:by==='me'?styles.time_me:styles.time_stranger}
    return (
        <Animated.View entering={FadeIn} style={[styles.chat,style.cover]}>
            <Text style={[styles.chat_text,style.text]}>{text}</Text>
            <Text style={[styles.time,style.time]}>{time}</Text>
        </Animated.View>
    )
},()=>true);

const styles = StyleSheet.create({
    footer:{
        height:hp(15),
    },
    typing_view:{
        backgroundColor:colors.white,
        borderRadius:wp(3),
        paddingLeft:wp(.5),
        paddingRight:wp(.5),
        height:hp(4.2),
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'flex-start'
    },
    chat_me:{
        backgroundColor:colors.blue,
        alignSelf:'flex-end'
    },      
    chat:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-end',
        marginBottom:hp(.5),
        borderRadius:wp(3),
        padding:wp(4),
        paddingTop:wp(2),
        paddingBottom:wp(2),
    },
    time_me:{
        color:colors.grey
    },
    time_stranger:{
        color:colors.text_grey
    },
    time:{
        fontFamily:fonts.title_regular,
        fontSize:wp(3.2),
        marginLeft:wp(1.5),
    },
    chat_text_me:{
        color:colors.white
    },  
    chat_text:{
        color:colors.black,
        fontFamily:fonts.title_regular,
        fontSize:wp(4.5)
    },  
    chat_stranger:{
        backgroundColor:colors.white,
        alignSelf:'flex-start'
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
        color:colors.blue,
        fontFamily:fonts.title_text,
        fontSize:wp(4.5)
    }
});

export default TextChat;

