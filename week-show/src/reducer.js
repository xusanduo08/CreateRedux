function reducer(state, action){
  switch(action.type){
    case 'CHANGE_NAME':
      return {...state, ...action.payload};
    case 'CHANGE_AGE':
      return {...state, ...action.payload};
    default:
      return state;
  }
}

export default reducer;