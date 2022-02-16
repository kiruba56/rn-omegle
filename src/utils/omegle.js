import axios from 'axios';
import qs from 'querystring';
import EventEmitter from 'events';
import UserAgent from 'react-native-user-agent';
import format from 'date-fns/format';

const events = [
    // status events
    'waiting','connected','statusInfo','count',
    // error events -> handle all these error in app
    'error','connectionDied','antinudeBanned',
    // recaptcha
    'recaptchaRequired','recaptchaRejected',
    // chat
    'typing', 'stoppedTyping', 'strangerDisconnected',//'gotMessage' -> removing gotMessage to intercept the payload and emit a custom payload
    //webrtc
    'rtccall','icecandidate','rtcpeerdescription'

]

class Omegle extends EventEmitter{
    constructor(lang="en",unmoderated=false,topics=[]){
        super();
        this._user_agent_ = null;
        this._language_ = lang;
        this._url_ = 'front1.omegle.com';

        this._client_id_ = null;

        this._servers_ = [];
        this._is_connected_ = false;
        this._use_querystring_ = ['start','status']; //user urlencoded for other requests.

        this._challenge_ = null;

        this._total_users_ = null;

        this._is_unmonitored_section_ = unmoderated;
        this._topics_ = topics;

        // the server will send the waiting event and then search for people with the same topics until the client sends this. Use it after some time to stop the running search, ignore the topics and continue with connecting.
        this._stop_for_common_like_timer_ = null;

        this._chat_ = [
            
        ];


    };


    set_user_agent = () => {
        return new Promise(async(resolve)=>{
            try{
                const user_agent = await UserAgent.getWebViewUserAgent();
                this._user_agent_ = user_agent;
                resolve();
            }catch(e){
                this._user_agent_ = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
                // resolve instead of reject because a default value will be set
                resolve();
            };
        }); 
    };

    get_request_option = (path="",data,method) => {
        const is_qs = this._use_querystring_.includes(path);
        const stringified_data = qs.stringify(data);
        return {
            url:`https://${this._url_}/${path}`,
            header:{
                'User-Agent': this._user_agent_,
                'Connection': 'keep-alive',
                'Accept-Language': 'en-US;q=0.6,en;q=0.4',
                'Referer': 'http://www.omegle.com',
                'Origin': 'http://www.omegle.com',
                'Host': this._url_,
                'DNT': 1,
                'Accept-Encoding': 'gzip,deflate',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': !is_qs?stringified_data.length:0,
            },
            [is_qs?'params':'data']:is_qs?data:stringified_data,
            method:method
        }
    };

    request = (path,data,method="POST") => {
        return new Promise(async(resolve,reject)=>{
            try{
                const option = this.get_request_option(path,data,method);
                const response = await axios(option);
                if(response.status===200){
                    !this._servers_.includes(this._url_)&&this._servers_.push(this._url_);
                    return resolve(response.data);
                };
                throw new Error(`Error in request response inside request function in Omegle class ${response}`);
            }catch(e){
                console.log("Error in request method inside Omegle class.", e);
                // removing the current server from available server list.
                const current_url_index = this._servers_.indexOf(this._url_);
                current_url_index>=0&&this._servers_.splice(current_url_index,1); 
                reject(e);
            };
        });
    };

    setup_server = () => {
        return new Promise(async(resolve,reject)=>{
            try{
                const data = await this.request('status',{nocache:Math.random(),randid:this.random()},'GET');
                if(data&&data.servers){
                    if(data.force_unmon){
                        this.emit("ip_banned");
                    };
                    if(data.servers&&data.servers.length>0){
                        this._url_ = data.servers[0]+'.omegle.com';
                    };
                    this._total_users_ = data.count;
                    return resolve();
                };
                throw new Error(`Error in setup_server ${JSON.stringify(data)}`);
            }catch(e){
                console.log("Error in setup_server inside Omegle class.", JSON.stringify(e));
                if(this._servers_.length>0){
                    this._url_ = this._servers_[this._servers_.length-1];
                };
                reject(e);
            };
        });
    };

    start = (camera="FaceTime HD Camera") => {
        // group = unmon for unmonitered section
        return new Promise(async(resolve,reject)=>{
            try{
                if(!this._user_agent_){
                    await this.set_user_agent();
                };
                let data = {rcs:1,firstevents:1,lang:this._language_,randid: this.random(),spid:'',webrtc:1,caps:'recaptcha2,t',camera};
                await this.setup_server();
                if(this._topics_.length>0){
                    data['topics'] = this._topics_;
                };
                if(this._is_unmonitored_section_){
                    data['group'] = 'unmon';
                };
                // console.log(data);
                const response = await this.request('start',data);
                if(response&&response.clientID){
                    this._client_id_ = response.clientID;
                    this.on_events(response.events);
                    this.poll();
                    return resolve(this._client_id_);
                };  
                throw new Error(`Error in start Omegle response ${response} ${data} ${camera}`);
            }catch(e){
                console.log("Error in connect inside omegle class.",e);
                reject(e);
            };
        });
    };

    poll = async() => {
        try{
            if(!this._client_id_){
                return false;
            };
            const events = await this.request('events',{id:this._client_id_});
            this.on_events(events);
            this._client_id_&&this.poll();
        }catch(e){
            console.log("Error in poll inside Omegle Class",e);
            this._client_id_&&this.poll();
        };
    };

    stop_looking_for_common_likes = () => {
        return new Promise(async(resolve,reject)=>{
            try{
                const response = await this.request('stoplookingforcommonlikes',{id:this._client_id_});
                if(response==='win'){
                    return resolve();
                };
                throw new Error(`Error in stop_looking_for_common_likes response ${response}`);
            }catch(e){
                console.log("Error in stop_looking_for_common_likes in Omegle class",e);
                reject(e);
            };
        });
    };

    toggle_typing = (to=false)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                // console.log("called",to);
                const response = await this.request(to?'typing':'stoppedtyping',{id:this._client_id_});
                if(response==='win'){
                    // console.log("typing",to,response);s
                    return resolve();
                };
                throw new Error(`Error in toggle_typing response ${response}`);
            }catch(e){
                console.log("Error in toggle_typing in Omegle class",e);
                reject(e);
            };
        });
    };

    send_message = (msg="")=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const data = {by:'me',id:this.random(),text:msg,time:format(new Date(), 'HH:mm')};
                this._chat_.push(data);
                this.emit('gotMessage',data);
                const response = await this.request('send',{msg,id:this._client_id_});
                if(response==='win'){
                    return resolve();
                };
                throw new Error(`Error in send_message response ${response}`);
            }catch(e){
                console.log("Error in send_message in Omegle class",e);
                reject(e);
            };
        });
    };

    send_ice_candidates = (candidates) => {
        return new Promise(async(resolve,reject)=>{
            try{
                let cdi = [];
                candidates.forEach(d=>cdi.push(JSON.stringify(d)));
                const response = await this.request('icecandidate',{candidate:cdi,id:this._client_id_});
                if(response==='win'){
                    return resolve();
                };
                throw new Error(`Error in send_ice_candidates response ${response}`);
            }catch(e){
                console.log("Error in send_ice_candidates in Omegle class",e);
                reject(e);
            };
        });
    };

    send_rtc_peer_description = (desc)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const response = await this.request('rtcpeerdescription',{desc:JSON.stringify(desc),id:this._client_id_});
                if(response==='win'){
                    return resolve();
                };
                throw new Error(`Error in send_rtc_peer_description response ${response}`);
            }catch(e){
                console.log("Error in send_rtc_peer_description in Omegle class",e);
                reject(e);
            };
        });
    };

    solve_recaptach = (answer)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                const response = await this.request('recaptcha',{response:answer,challenge:this._challenge_,id:this._client_id_});
                if(response==='win'){
                    return resolve();
                };
                throw new Error(`Error in solve_recaptach response ${response}`);
            }catch(e){
                console.log("Error in solve_recaptach in Omegle class",e);
                reject(e);
            };
        });
    };  

    on_events = (event=[]) => {
        try{
            if(!event||(event&&event.length===0)){
                return false;
            };
            event.map(v=>{
                const [name, payload] =  [v[0],v[1]||null];
                this.handle_event(name,payload);
                // only emit events that we may need 
                // console.log(name, payload);
                events.includes(name)&&this.emit(name,payload);
            });
        }catch(e){
            console.log("Error in on_events",e)
        }
       
    };

    handle_event = (name,payload) => {
        switch(name){
            case 'waiting':
                return this._event_waiting();
            case 'connected':
                return this._event_connected();
            case 'statusInfo':
                return this._event_staus_info(payload);
            case 'gotMessage':
                return this._event_got_message(payload);
            case 'recaptchaRequired':
                return console.log(payload);
            case 'count':
                return this._total_users_ = payload;
            case 'strangerDisconnected':
                return this.reset();
            default:
               break;
        };
    };

    _event_got_message = (msg) => {
        const data = {by:'stranger',id:this.random(),text:msg,time:format(new Date(), 'HH:mm')};
        this._chat_.push(data);
        // emiting a custom event
        this.emit('gotMessage',data);
    };

    _event_connected = () => {
        if(this._stop_for_common_like_timer_)clearTimeout(this._stop_for_common_like_timer_);
        this._stop_for_common_like_timer_ = null;
        this._is_connected_ = true;
    };

    _event_waiting = () => {
        if(this._topics_.length>0){
            this._stop_for_common_like_timer_ = setTimeout(async()=>{
                try{
                    await this.stop_looking_for_common_likes();
                }catch(e){
                }
            },2000);
        };
    };

    _event_staus_info = (payload) => {
        // Omegle returns a string when a server error occurs
        if(typeof payload!== "object"){
            return;
        };
        if(payload.force_unmon){
            this.emit("ip_banned");
        };
        if(payload.servers&&payload.servers.length>0){
            this._url_ = payload.servers[0]+'.omegle.com';
        };
        this._total_users_ = payload.count;
    };

    disconnect = () => {
        return new Promise(async(resolve,reject)=>{
            try{
                const response = await this.request('disconnect',{id:this._client_id_});
                if(response==='win'){
                    this.reset();
                    return resolve();
                };
                throw new Error(`Error in disconnect response ${response}`);
            }catch(e){
                console.log("Error in disconnect in Omegle class",e);
                reject(e);
            };
        }); 
    };

    reset = () => {
        this._is_connected_ = false;
        this._challenge_ = null;
        this._client_id_ = null;
        this._chat_ = [];
    }

    random = () => {
        const len = 8;
        const p = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
        return [...Array(len)].reduce(a=>a+p[~~(Math.random()*p.length)],'');
    };

    is_connected = () => {
        return this._is_connected_;
    };

    get_chat = () => this._chat_;

};

export default Omegle;