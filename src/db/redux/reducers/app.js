
const _initial_state_ = {
    user:{
        name:null,
        topics:[],
        language:{id:'en',name:'English'},
        unmoderated:false,
        autoroll:true
    }
};

export default (state=_initial_state_,action) => {
    switch(action.type){
        default:
            return state;
    };
};