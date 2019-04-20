export default function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return {text: action.text}
    default:
      return {text:'default'}
  }
}