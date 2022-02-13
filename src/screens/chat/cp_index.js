import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity} from 'react-native';
import { RTCPeerConnection, RTCView, mediaDevices, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';
import Animated, { FadeInUp, SlideInDown, SlideInUp } from 'react-native-reanimated';
import { hp, wp } from '../../utils/responsive';
import Omegle from '../../utils/omegle';



const configuration = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
};


class Home extends React.PureComponent{
    constructor(){
        super();
        this.state = {
            localStream:null,
            remoteStream:null,
            cachedLocalPC:null
        };
        this.omegle = null;
        this.local_ice_candidates = [];
        this.remote_ice_candidates = [];
        this.has_rtc_call_happened = false;
    };

    componentDidMount(){
        this.set_local_stream();
    };

    componentWillUnmount(){
        this.omegle = null;
    }

    ready =async () => {
       this.omegle = new Omegle();

       this.omegle.on('strangerDisconnected',()=>{
           console.log("DISCONNECTED");
       })

       this.omegle.on('error',e=>{
           console.log(e);
           this.omegle.start();
       })

       this.omegle.on('icecandidate',candidate=>{
            this.remote_ice_candidates.push(candidate);
            if(this.has_rtc_call_happened){
                this.state.cachedLocalPC.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>{
                    console.log(e);
                })
            };
       });
       
       this.omegle.on('rtccall',async()=>{
            const offer = await this.state.cachedLocalPC.createOffer();
            await this.state.cachedLocalPC.setLocalDescription(offer);
            await this.omegle.send_rtc_peer_description(this.state.cachedLocalPC.localDescription);
            this.has_rtc_call_happened = true;
       });

       this.omegle.on('rtcpeerdescription',async(data)=>{
            // console.log('rtcpeerdescription data',this.state.cachedLocalPC.localDescription);

           

            if (!this.state.cachedLocalPC.currentRemoteDescription) {
                const rtcSessionDescription = new RTCSessionDescription(data);
                try{
                    await this.state.cachedLocalPC.setRemoteDescription(rtcSessionDescription);
                }catch(e){
                    console.log("ERror in rtcpeerdescription")
                    console.log(e);                    
                }
            
                if(!this.has_rtc_call_happened){
                    const answer = await this.state.cachedLocalPC.createAnswer();
                    await this.state.cachedLocalPC.setLocalDescription(answer);
                    await this.omegle.send_rtc_peer_description(this.state.cachedLocalPC.localDescription);
                    
                };
                this.remote_ice_candidates.map(d=>{
                    if(!this.state.cachedLocalPC.remoteDescription){
                       return;
                   };
                   this.state.cachedLocalPC.addIceCandidate(new RTCIceCandidate(d)).catch(e=>{
                       console.log(e, d);
                   })
               });
            }
       });

    //    this.omegle.on('icecandidate',(data)=>{
    //         if(!this.state.cachedLocalPC.remoteDescription){
    //             return;
    //             };
    //         console.log('icecandidate data',data);
    //         this.state.cachedLocalPC.addIceCandidate(new RTCIceCandidate(data));
    //     });
        this.omegle.on('gotMessage',data=>{
            console.log("msg",data);
        })
        try{

           await this.omegle.start();
        }catch(e){
            console.log(e);
        }

    };

    login = async() => {
        try{
            this.set_local_stream();
        }catch(e){
            alert("NO USER")
        };  
    
    }

    start = async() => {
        try{
            const localPC = new RTCPeerConnection(configuration);
            localPC.addStream(this.state.localStream);

            // const roomRef = await firestore().collection('rooms').doc(room_id);
            // const callerCandidatesCollection = roomRef.collection('callerCandidates');

            localPC.onicecandidate = e => {
                if (!e.candidate) {
                  console.log('Got final candidate!');
                  setTimeout(()=>{
                    this.omegle.send_ice_candidates(this.local_ice_candidates).catch(e=>{
                        console.log(e);
                    })
                  },300);
                   
                
                  return;
                }
                this.local_ice_candidates.push(e.candidate);
                // console.log(this.ice_candidates);
                // console.log(this.ice_candidates);
                // callerCandidatesCollection.add(e.candidate.toJSON());
                // console.log(e.candidate);
                // this.omegle&&this.omegle.sendICECandidates(e.candidate.toJSON())
            };

            localPC.onaddstream = e => {
                if (e.stream && this.state.remoteStream !== e.stream) {
                  console.log('RemotePC received the stream call');
                  this.setState({remoteStream:e.stream});
                }
            };

            // await localPC.createOffer({mandatory: {
            //     OfferToReceiveAudio: !0,
            //     OfferToReceiveVideo: !0
            // }});
            // const offer = await localPC.createOffer();
            // await localPC.setLocalDescription(offer);
        

            // const offer = await localPC.createOffer();
            // await localPC.setLocalDescription(offer);


            // // const roomWithOffer = { offer };
            // // await roomRef.set(roomWithOffer);
            // // this.omegle&&this.omegle.sendRTCPeerDescription(offer);


            // roomRef.onSnapshot(async snapshot => {
            //     const data = snapshot.data();
            //     if (!localPC.currentRemoteDescription && data.answer) {
            //       const rtcSessionDescription = new RTCSessionDescription(data.answer);
            //       await localPC.setRemoteDescription(rtcSessionDescription);
            //     }
            // });

            // roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            //     snapshot.docChanges().forEach(async change => {
            //       if (change.type === 'added') {
            //         let data = change.doc.data();
            //         await localPC.addIceCandidate(new RTCIceCandidate(data));
            //       }
            //     });
            // });
          
            this.setState({cachedLocalPC:localPC},()=>{
                this.ready();
            })
          

        }catch(e){
            console.log("start",e);
        }
    };


    clear = () => {
        if (this.state.cachedLocalPC) {
            this.state.cachedLocalPC.removeStream(this.localStream);
            this.state.cachedLocalPC.close();
        };
        this.setState({
            localStream:null,
            remoteStream:null,
            cachedLocalPC:null
        });
    };

    switchCamera = () => {
        this.state.localStream.getVideoTracks().forEach(track => track._switchCamera());
    };

    set_local_stream = async() => {
        try{
            const isFront = !true;
            const devices = await mediaDevices.enumerateDevices();
    
            const facing = isFront ? 'front' : 'environment';
            const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === facing);

            const facingMode = isFront ? 'user' : 'environment';
            const constraints = {
                audio: true,
                video: {
                  mandatory: {
                    minWidth: wp(97),
                    minHeight: hp(40),
                    // minFrameRate: 30,
                  },
                  facingMode,
                  optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                },
              };
              this.setState({localStream:null,remoteStream:null})
            const newStream = await mediaDevices.getUserMedia(constraints);
            this.setState({localStream:newStream},()=>{
                this.start();
            });
            // console.log(this.state.localStream)
            
        }catch(e){
            console.log("set_local_stream", e);
        }
      
    };


    render(){
        return (
            <View style={styles.container}>
                <View style={styles.view}>
                     <RTCView  zOrder={20}   style={styles.flex} streamURL={this.state.localStream && this.state.localStream.toURL()} />
                </View>
                <View style={styles.view}>
                    <RTCView zOrder={20}  style={styles.flex} streamURL={this.state.remoteStream && this.state.remoteStream.toURL()} />
                </View>
                {
                    !this.state.localStream?
                    <View style={styles.bottom}/>
                    :
                    <Animated.View entering={SlideInDown} style={styles.bottom}>
                        <TouchableOpacity onPress={this.start}> 
                            <View style={styles.button}>
                                    <Text style={styles.btn_text}>START</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.switchCamera}>
                            <View style={styles.button}>
                                <Text style={styles.btn_text}>SWITCH CAMERA</Text>
                            </View>
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={this.join}>
                            <View style={styles.button}>
                                <Text style={styles.btn_text}>JOIN</Text>
                            </View>
                        </TouchableOpacity> */}
                        
                    </Animated.View>
                }
            </View>
        )
    }
};


export default Home;


const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'space-around',
        alignItems:'center'
    },
    flex:{
        flex:1
    },
    view:{
        width:wp(97),
        height:hp(40),
        backgroundColor:'red'
    },
    bottom:{
        height:hp(10),
        width:wp(95),
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection:'row',
        alignSelf:'center'
    },
    button:{
        backgroundColor:'#000',
        // marginLeft:wp(6),
        // marginRight:wp(6),
        padding:wp(3.5),
        paddingLeft:wp(5),
        paddingRight:wp(5)
    },
    btn_text:{
        color:'#fff',
        fontSize:wp(4)
    }
});