export default function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return {...state, text: ++state.text}
    case 'DEL':
      return {...state, text: --state.text}
    case 'RENAME':
      return {...state, name: 'yyy'}
    default:
      return {text:1, name:'xxx'}
  }
}