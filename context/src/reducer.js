export default function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return {...state, text: ++state.text}
    case 'DEL':
      return {...state, text: --state.text}
    default:
      return {text:1}
  }
}