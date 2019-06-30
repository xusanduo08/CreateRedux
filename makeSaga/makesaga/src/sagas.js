
import { take, actionChannel, put, call } from './saga/effects.js';

function cal(a, b) {
  return a * b;
}

function* it(){
  yield take('sagaTest2');
}

function* pSaga() {  // watcher saga
  let result = [];
  let chan = yield actionChannel('saga test channel');

  result.push(yield take(chan));
  console.log(result);

  result.push(yield call(it));
  result.push(yield it());
  console.log(result);
}

export default pSaga;