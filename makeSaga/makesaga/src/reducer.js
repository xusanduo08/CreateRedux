export default (state={}, action) =>{
    switch (action.type){
        case 'START':
            return {...state};
        case 'PAUSE':
            return {...state};
        default:
            return state;
    }
}