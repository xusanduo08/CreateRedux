
import { take, actionChannel, put } from './saga/effects.js';

function* pSaga() {  // watcher saga
  let result = [];
  let chan = yield actionChannel('saga test channel');

  while(true){
    result.push(yield take(['sagaTest1', 'sagaTest2']));
    yield put({type:'PUT_ACTION', payload:'PUT_ACTION'})
    result.push(yield take(chan));
    console.log(result);
    
    result.push(yield take('sagaTest2'));
    
    result.push(yield take('sagaTest3'));
    console.log(result);
  }
  
}

export default pSaga;