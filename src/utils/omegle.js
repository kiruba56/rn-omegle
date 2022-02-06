import axios from 'axios';
import qs from 'querystring';

class Omegle {
    constructor(){
        this._agent_ = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36';
        this._language_ = 'en';
        this._url_ = 'front1.omegle.com';

        this._client_id_ = null;

        this._servers_ = [];
        this._is_connected_ = false;
        this._use_querystring_ = ['start','status']; //user urlencoded for other requests.

        this._challenge_ = null;

        this._total_users_ = null;

    };


    get_request_option = (path="",data,method) => {
        const is_qs = this._use_querystring_.includes(path);
        const stringified_data = qs.stringify(data);
        return {
            url:`https://${this._url_}/${path}`,
            header:{
                'User-Agent': this._agent_,
                'Connection': 'keep-alive',
                'Accept-Language': 'en-US;q=0.6,en;q=0.4',
                'Referer': 'http://www.omegle.com',
                'Origin': 'http://www.omegle.com',
                'Host': this._url_,
                'DNT': 1,
                'Accept-Encoding': 'gzip,deflate',
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': is_qs?stringified_data.length:0,
                [is_qs?'params':'data']:is_qs?data:typeof data === 'string'?data:stringified_data
            },
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
                if(data&&data.server){
                    if(data.force_unmon){
                        return reject("ip_banned");
                    };
                    this._url_ = data.server[0]+'.omegle.com';
                    this._total_users_ = data.count;
                    return resolve();
                };
                throw new Error(`Error in setup_server ${data}`);
            }catch(e){
                console.log("Error in setup_server inside Omegle class.", e);
                if(this._servers_.length>0){
                    this._url_ = this._servers_[this._servers_.length-1];
                };
                reject(e);
            };
        });
    };

    start = (camera="FaceTime HD Camera",topics=[],unmointered=false) => {
        // group = unmon for unmonitered section
        return new Promise(async(resolve,reject)=>{
            try{
                await this.setup_server();
                let data = {rcs:1,firstevents:1,lang:this._language_,randid:this.random(),spid:'',webrtc:1,caps:'recaptcha2,t',camera};
                if(topics.length>0){
                    data['topics'] = topics;
                };
                if(unmointered){
                    data['group'] = 'unmon';
                };
                const response = await this.request('start',data);
                if(response&&response.clientID){
                    this._client_id_ = response.clientID;
                    this.on_events(response.events);
                    return resolve(this._client_id_);
                };  
                throw new Error(`Error in start Omegle response ${e}`);
            }catch(e){
                console.log("Error in connect inside omegle class.",e);
                reject(e);
            };
        });
    };

    poll = async() => {
        try{
            if(!this._client_id_||!this.is_connected){
                return false;
            };
            const events = await this.request('events',{id:this.id});
            this.on_events(events);
            this._client_id_&&this._is_connected_&&this.poll();
        }catch(e){
            console.log("Error in poll inside Omegle Class",e);
            this._client_id_&&this._is_connected_&&this.poll();
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
                const response = await this.request(to?'typing':'stoppedtyping',{id:this._client_id_});
                if(response==='win'){
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

    on_events = (ev) => {

    };

    disconnect = () => {
        return new Promise(async(resolve,reject)=>{
            try{
                const response = await this.request('disconnect',{id:this._client_id_});
                if(response==='win'){
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
    }

    random = () => {
       return Math.random().toString(36).substring(2,8).toUpperCase();
    };

    is_connected = () => {
        return this._is_connected_;
    };


};