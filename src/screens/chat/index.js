import React from 'react';
import {View,StyleSheet, StatusBar, TouchableOpacity,Image,Text,BackHandler} from 'react-native';
import colors from '../../theme/colors';
import default_styles from '../../theme/default_styles';
import fonts from '../../theme/fonts';
import { hp, wp } from '../../utils/responsive';
import Bouncy from '../../components/bouncy';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import { Navigation } from 'react-native-navigation';
import Omegle from '../../utils/omegle';
import LoadingView from './_loading_view';
import Animated, { FadeInDown, FadeOutDown, FadeOutUp, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { connect } from 'react-redux';
import { dismiss_chat } from '../../navigations/flow/chat';
import TypingView from './_typing_view';
import { open_sheet } from '../../navigations/flow/sheet';
import { text_chat } from '../../navigations/constant';

const status_bar_height = StatusBar.currentHeight;
const icon_hitslop = {top:hp(2),bottom:hp(2),right:wp(5),left:wp(5)};

const rtc_peer_configuration = {iceServers: [{urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']}],iceCandidatePoolSize: 10};


class Chat extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            _remote_stream:null,
            _local_stream:null,
            _is_connected:false,
            _is_user_typing:false,
            _looking_for_someone:true
        };

        const language_id = (this.props.language&&this.props.language.id) || 'en';
        this._omegle_ = new Omegle(language_id,this.props.unmoderated,this.props.topics);
        this._rtc_peer_connection_ = null;

        // saving the icecandidates to send to oemgle
        this._tmp_ice_candidates_ = [];
        // saving the recvided icecandidates to add in the right state.
        this._recived_ice_candidates_ = [];
        this._has_rtc_call_happened_ = false;

        Navigation.events().bindComponent(this);
        // to only do something when component appeared for the first time. RNN trigger componentDidAppear everytime this screen come top in the stack. 
        this._component_appeared_ = false;
    };

    // _set_count_ref_ = ref => this._count_ = ref;
    _set_recent_text_ref_ = ref => this._recent_text_ = ref;

    _close_ = () => {
        this._rtc_peer_connection_&&this._rtc_peer_connection_.close();
        this._omegle_&&this._omegle_.is_connected()&&this._omegle_.disconnect();
        this._omegle_&&this._omegle_.removeAllListeners();
        dismiss_chat(this.props.componentId);
        return true;
    };


    // calling _set_local_stream_ in componentDidAppear to avoid framedrops when this screens shows up.
    // componentDidAppear(){   
    //     if(!this._component_appeared_){
    //         this._set_omegle_listners_();
    //         this._start_();
    //         this._component_appeared_ = true;
    //     };
    // };

    componentDidMount(){
        this._back_handler_ = BackHandler.addEventListener("hardwareBackPress",this._close_);
        this._set_omegle_listners_();
        this._start_();
    }

    componentWillUnmount(){
        this._omegle_ = null;
        this._back_handler_&&this._back_handler_.remove();
    }

    _start_ = async() => {
        try{
            // setting current user camera view before initializing Omegle
            !this.state._local_stream&&await this._set_local_stream_();
            await this._set_peer_connection_();
            await this._omegle_.start();

        }catch(e){
            console.log(e);
        };
    };

    _set_omegle_listners_ = () => {
        if(!this._omegle_){
            return;
        };

        this._omegle_.on('connected',()=>{
            this.setState({_is_connected:true,_looking_for_someone:false});
        });

        this._omegle_.on('strangerDisconnected',async()=>{
            try{
                if(this.props.autoroll){
                    await this._reset_();
                    return this._next_();
                };
                this._reset_();
            }catch(e){
                console.log("Error in strangerDisconnected listner", e);
            };
        });

        this._omegle_.on('error',e=>{
            console.log(e);
            this._omegle_.start();
        });

        this._omegle_.on('icecandidate',candidate=>{
            this._recived_ice_candidates_.push(candidate);
            if(this._has_rtc_call_happened_){
               this._rtc_peer_connection_.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>{
                    console.log(e);
                });
            };
       });

       this._omegle_.on('rtccall',async()=>{
           try{
                const offer = await this._rtc_peer_connection_.createOffer();
                await this._rtc_peer_connection_.setLocalDescription(offer);
                await this._omegle_.send_rtc_peer_description(this._rtc_peer_connection_.localDescription);
                this._has_rtc_call_happened_ = true;
           }catch(e){
                console.log("Error inside rtccall listner",e);
           };
        });
        
        this._omegle_.on('rtcpeerdescription',async(data)=>{
            if (!this._rtc_peer_connection_.currentRemoteDescription) {
                const rtc_session_description = new RTCSessionDescription(data);
                try{
                    await this._rtc_peer_connection_.setRemoteDescription(rtc_session_description);
            
                    if(!this._has_rtc_call_happened_){
                        const answer = await this._rtc_peer_connection_.createAnswer();
                        await this._rtc_peer_connection_.setLocalDescription(answer);
                        await this._omegle_.send_rtc_peer_description(this._rtc_peer_connection_.localDescription);
                        
                    };
                    this._rtc_peer_connection_.remoteDescription&&this._recived_ice_candidates_.map(d=>{
                        if(!this._rtc_peer_connection_.remoteDescription) return;
                        this._rtc_peer_connection_.addIceCandidate(new RTCIceCandidate(d))
                        .catch(e=>{
                            console.log(e);
                        });
                    });

                }catch(e){
                    console.log("ERror in rtcpeerdescription")
                    console.log(e);                    
                }
            }
       });


        this._omegle_.on('gotMessage',data=>{
            // this._count_&&this._count_._update_count(1);
            this._recent_text_&&this._recent_text_._update_text(data.text);
            if(this.state._is_user_typing){
                Navigation.updateProps(`${text_chat}.id`,{_is_stranger_typing:false});
                return this.setState({_is_user_typing:false});
            };
            // console.log("msg",data);
        });

        this._omegle_.on('typing',()=>{
            if(!this.state._is_user_typing){
                Navigation.updateProps(`${text_chat}.id`,{_is_stranger_typing:true});
                return this.setState({_is_user_typing:true});
            };
        });

        this._omegle_.on('stoppedTyping',()=>{
            if(this.state._is_user_typing){
                Navigation.updateProps(`${text_chat}.id`,{_is_stranger_typing:false});
                return this.setState({_is_user_typing:false});
            };
        });

    };

    _set_peer_connection_ = () => {
        return new Promise(async(resolve,reject)=>{
            try{
                this._rtc_peer_connection_ = new RTCPeerConnection(rtc_peer_configuration);

                this._rtc_peer_connection_.addStream(this.state._local_stream);

                this._rtc_peer_connection_.onicecandidate = e => {
                    if (!e.candidate) {
                            this._omegle_&&this._omegle_.send_ice_candidates(this._tmp_ice_candidates_).catch(e=>{
                                console.log(e);
                            })
                        return;
                    };
                    // this._omegle_.send_ice_candidates([e]).catch(e=>{
                    //     console.log("e",e);
                    // })
                    this._tmp_ice_candidates_.push(e.candidate);
                };

                this._rtc_peer_connection_.onaddstream = e => {
                    if (e.stream && this.state._remote_stream !== e.stream) {
                        // console.log('RemotePC received the stream call');
                      return this.setState({_remote_stream:e.stream});
                    };
                };
                resolve();
            }catch(e){
                reject(e);
            };
        });
    };


    _set_local_stream_ = () => {
        return new Promise(async(resolve,reject)=>{
            try{

                const is_front = !true;
                const devices = await mediaDevices.enumerateDevices();
                const facing = is_front ? 'front' : 'environment';
                const faceing_mode = is_front ? 'user' : 'environment';
    
                const source_id = devices.find(device => device.kind === 'videoinput' && device.facing === facing);
    
                const constraints = {audio: true, video: {mandatory: {minWidth:wp(100),minHeight: hp(50)}, facingMode:faceing_mode, optional: source_id ? [{ sourceId: source_id }] : [] }};
                const _local_stream = await mediaDevices.getUserMedia(constraints);

                this.setState({_local_stream},resolve);
            }catch(e){
                reject(e);
            }
        });
    };

    _switch_camera_ = () => {
        this.state._local_stream&&this.state._local_stream.getVideoTracks().forEach(track => track._switchCamera());
    };

    _on_chat_ = () => {
        // this._count_&&this._count_._reset();
        this._recent_text_&&this._recent_text_._reset();
        open_sheet(text_chat,{
            send:(txt)=>{
                this.state._is_connected&&this._omegle_&&this._omegle_.send_message(txt);
            },
            toggle_typing:(to)=>this.state._is_connected&&this._omegle_&&this._omegle_.toggle_typing(to),
            _is_user_typing:this.state._is_user_typing,
            _data:this._omegle_.get_chat()
        });

    };

    _reset_ = () => {
        return new Promise(async(resolve,reject)=>{
            try{
                this._has_rtc_call_happened_ = false;
                this.setState({_remote_stream:null,_is_connected:false,_is_user_typing:false,_looking_for_someone:Boolean(this.props.autoroll)});
                // this._count_&&this._count_._reset();
                this._recent_text_&&this._recent_text_._reset();
                if(this._omegle_&&this._omegle_.is_connected()){
                    await this._omegle_.disconnect();
                };
                this._rtc_peer_connection_&&this._rtc_peer_connection_.close();
                this._rtc_peer_connection_ = null;
                this._tmp_ice_candidates_ = [];
                this._recived_ice_candidates_ = [];
                resolve();
            }catch(e){
                console.log("Error in _reset_", e);
                reject();
            };
        });
    };

    _next_ = async() => {
        try{
            if(this.state._remote_stream||this._rtc_peer_connection_){
                await this._reset_();
            };
            if(!this.state._looking_for_someone){
                this.setState({_looking_for_someone:true});
            };
            await this._set_peer_connection_();
            this._omegle_&&this._omegle_.start();
        }catch(e){
            console.log("Error in _next_", e);
        };
    };

    render(){
        return (
            <>
                <View style={[default_styles.align_between]}>

                    <View style={[styles.stream_container]}>
                         <RTCView zOrder={20} style={[default_styles.flex]} objectFit="cover" streamURL={this.state._remote_stream&&this.state._remote_stream.toURL()} />
                         {!this.state._remote_stream&&this.state._looking_for_someone&&
                         <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.loading_container}>
                                <LoadingView />
                         </Animated.View>}
                        {this.state._is_user_typing&&
                        <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.strem_cover}>
                                <TypingView />
                         </Animated.View>}
                    </View>
                    <View style={[styles.stream_container,styles.local_stream]}>
                        <RTCView zOrder={20} style={default_styles.flex} objectFit="cover" streamURL={this.state._local_stream&&this.state._local_stream.toURL()} />
                    </View>

                </View>

                <View style={styles.overlay}>
                    <View style={styles.top}>
                        <TouchableOpacity onPress={this._close_} hitSlop={icon_hitslop}>
                            <Image source={require('../../assets/icons/back_drop.png')} resizeMode="cover" style={styles.shadow} />
                            <Image source={require('../../assets/icons/close.png')} resizeMode="contain" style={styles.close}/>
                        </TouchableOpacity>
                    </View>
                    <View>

                        <RecentText ref={this._set_recent_text_ref_}/>

                        <Animated.View style={styles.bottom}>
                            <View style={styles.bottom_button_row}>
                                    <TouchableOpacity onPress={this._switch_camera_} style={styles.icon_container} hitSlop={icon_hitslop}>
                                        <Image source={require('../../assets/icons/back_drop.png')} resizeMode="cover" style={[styles.shadow,styles.icon_shadow]} />
                                        <Image source={require('../../assets/icons/camera.png')} resizeMode="contain" style={styles.camera}/>
                                    </TouchableOpacity>

                                    <TouchableOpacity disabled={!this.state._is_connected} onPress={this._on_chat_} style={[styles.icon_container,styles.chat_aligner]} hitSlop={icon_hitslop}>
                                        <Image source={require('../../assets/icons/back_drop.png')} resizeMode="cover" style={[styles.shadow,styles.icon_shadow]} />
                                        <Image source={require('../../assets/icons/chat.png')} resizeMode="contain" style={styles.chat}/>
                                        {/* <Count ref={this._set_count_ref_}/> */}
                                    </TouchableOpacity>
                            </View>
                            
                            {(this.state._is_connected||(!this.state._is_connected&&!this.props.autoroll))&&
                            <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                                <Bouncy onPress={this._next_} hitSlop={icon_hitslop}>
                                    <View style={styles.btn}>
                                            <Text style={styles.btn_text}>Next</Text>
                                    </View>
                                </Bouncy>
                            </Animated.View>}
                        </Animated.View>
                            
                    </View>
                </View>
            </>
        );
    };
};


class RecentText extends React.PureComponent{
    constructor(){
        super();
        this.state = {
            text:null
        };
        this.timer = null;
    };

    componentWillUnmount(){
        this.timer&&clearTimeout(this.timer);
    }

    _reset = () =>{
        this.timer&&clearTimeout(this.timer);
        if(this.state.text){
            this.setState({text:null});
        };
    };

    _update_text = txt => {
        this.timer&&clearTimeout(this.timer);
        // removing the recent text view after a certaiin time
        this.timer = setTimeout(()=>{
            this.setState({text:null})
        },1000);
        this.setState({text:txt});
    };

    render(){
        if(!this.state.text){
            return null;
        };
        return (
            <Animated.View key={this.state.text} entering={FadeInDown} exiting={FadeOutUp}  style={styles.chat_alert}>
                <Text style={styles.chat_text}>{this.state.text}</Text>
            </Animated.View>
        )
    }
}

// class Count extends React.PureComponent{
//     constructor(){
//         super();
//         this.state = {
//             count:0
//         };
//     };

//     _reset = () => {
//         if(this.state.count>0){
//             this.setState({count:0});
//         };
//     };

//     _update_count = (by=0) => {
//         if(by===0){
//             return;
//         };
//         this.setState((prv)=>{
//             return {
//                 count:prv.count+by
//             }
//         });
//     }; 

//     render(){
//         if(this.state.count===0){
//             return null;
//         };
//         return (
//             <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={styles.dot}>
//                 <Text style={styles.dot_text}>{this.state.count>9?'9+':this.state.count}</Text>
//             </Animated.View>
//         )
//     };
// };

const styles = StyleSheet.create({
    stream_container:{
        width:'100%',
        flex:1,
        backgroundColor:colors.black
    },  
    local_stream:{
        height:hp(50)
    },
    strem_cover:{
        ...StyleSheet.absoluteFill,
        alignItems:'flex-start',
        justifyContent:'flex-end'
    },
    loading_container:{
        ...StyleSheet.absoluteFill,
        justifyContent:'center',
        alignItems:'center'
    },
    overlay:{
        position:'absolute',
        left:0,
        top:0,
        right:0,
        bottom:0,
        padding:wp(5),
        paddingTop:wp(5)+status_bar_height,
        justifyContent:'space-between'
    },
    top:{
        flexDirection:'row',
        justifyContent:'space-between'
    },
    close:{
        width:wp(5),
        height: wp(5),
        tintColor:colors.white,
    },
    shadow:{
        tintColor:colors.dark,
        position:'absolute',
        opacity: .5,
        width:wp(5),
        height: wp(5),
        transform:[
            {
                scale:3.2
            }
        ]
    },
    bottom:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-end'
    },
    bottom_button_row:{
        flexDirection:'row'
    },
    icon_shadow:{
        transform:[
            {
                scale:3.5
            }
        ]
    },
    chat_text:{
        fontFamily:fonts.title_regular,
        color:colors.black,
        fontSize:wp(4),
    },
    chat:{
        width:wp(7.3),
        height:wp(7.3),
        tintColor:colors.white
    },
    camera:{
        width:wp(9.2),
        height:wp(9.2),
        tintColor:colors.white
    },
    dot_text:{
        color:colors.black,
        fontFamily:fonts.title_regular,
        fontSize:wp(3.5),
    },
    chat_alert:{
        backgroundColor:colors.white,
        padding:wp(5),
        paddingBottom:wp(2.5),
        paddingTop:wp(2.5),
        marginBottom:hp(1),
        borderRadius:100,
        alignSelf:'flex-start',
        shadowColor: colors.white,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    dot:{
        backgroundColor:colors.white,
        width:wp(5),
        height:wp(5),
        borderRadius:100,
        position:'absolute',
        top:-wp(1),
        right:-wp(1),
        justifyContent:'center',
        alignItems:'center',
        shadowColor: colors.white,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    icon_container:{
        justifyContent:'center',
        alignItems:'center',
        overflow:'visible'
    },  
    chat_aligner:{
        marginLeft:wp(5)  
    },

    btn_text:{
        color:colors.black,
        fontFamily:fonts.button_title,
        fontSize:wp(4.8)
    },
   
    btn:{
        padding:wp(7),
        paddingBottom:wp(3),
        paddingTop:wp(3),
        borderRadius:100,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:colors.white,
    },  
});


const map_state_to_props = state => {
    return {
        ...state.app.user
    }
};

export default connect(map_state_to_props)(Chat);