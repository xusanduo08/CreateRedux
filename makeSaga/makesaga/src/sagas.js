
import { take, actionChannel } from './saga/effects.js';

function* pSaga() {  // watcher saga
  let result = [];
  let chan = yield actionChannel('sage test channel');
  while(true){
    result.push(yield take('sagaTest1'));
    result.push(yield take(chan));
    console.log(result);
    
    result.push(yield take('sagaTest2'));
    
    result.push(yield take('sagaTest3'));
    console.log(result);
  }
  
}

export default pSaga;