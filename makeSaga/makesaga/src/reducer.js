export default (state={}, action) =>{
    switch (action.type){
        case 'START':
            return {...state};
        case 'PAUSE':
            return {...state};
        case 'END':
            return {...action.payload}
        default:
            return state;
    }
}