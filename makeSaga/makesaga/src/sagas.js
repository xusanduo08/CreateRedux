
import { take } from './saga/effects.js';

function* pSaga() {  // watcher saga
  let result = yield take('sagaTest1');
  console.log(result);
}

export default pSaga;