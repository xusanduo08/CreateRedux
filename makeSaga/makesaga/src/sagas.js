
import { take, actionChannel, put, call } from './saga/effects.js';

function cal(a, b) {
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve(222);
    }, 1000)
  });
}

function* it(){
  yield take('sagaTest2');
  
}

function* pSaga() {  // watcher saga
  let result = [];
  let chan = yield actionChannel('saga test channel');

  result.push(yield take(chan));
  console.log(result);

  result.push(yield call(cal));
  result.push(yield it());
  result.push(yield cal());
  console.log(result);
}

export default pSaga;