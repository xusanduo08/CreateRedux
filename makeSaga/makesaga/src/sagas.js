
import { take } from './saga/effects.js';

function* pSaga() {  // watcher saga
  let result = [];
  result.push(yield take());
  result.push(yield take('sagaTest1'));
  
  
  result.push(yield take('sagaTest2'));
  
  result.push(yield take('sagaTest3'));
  console.log(result);
}

export default pSaga;