import { change_user_preference } from "../types";

const _initial_state_ = {
    user:{
        topics:[],
        language:{id:'en',name:'English'},
        unmoderated:false,
        autoroll:true
    }
};

export default (state=_initial_state_,action) => {
    switch(action.type){
        case change_user_preference:
            return{
                ...state,
                user:{
                    ...state.user,
                    [action.payload.field]:action.payload.value
                }
            }
        default:
            return state;
    };
};