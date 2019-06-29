
import { take, actionChannel, put, call } from './saga/effects.js';

function cal(a, b) {
  return a * b;
}

function* pSaga() {  // watcher saga
  let result = [];
  let chan = yield actionChannel('saga test channel');

  result.push(yield take(chan));
  console.log(result);

  result.push(yield call(cal, 3, 2))
  console.log(result);


}

export default pSaga;