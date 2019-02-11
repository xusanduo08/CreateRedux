export default function sagaMiddleware({ getState, dispatch }) {
  return next => action => {
    const result = next(action);

    return result;
  }
}