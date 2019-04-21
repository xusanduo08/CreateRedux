export default function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return {text: state.text++}
    default:
      return {text:1}
  }
}