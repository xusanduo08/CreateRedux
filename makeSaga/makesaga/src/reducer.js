export default (state = {}, action) => {
  switch (action.type) {
    case 'START':
      return { ...state };
    case 'PAUSE':
      return { ...state };
    case 'END':
      return { ...action.payload };
    case 'PUT_ACTION':
        return {text: action.payload};
    default:
      return state;
  }
}