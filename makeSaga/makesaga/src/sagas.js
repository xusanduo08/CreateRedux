
import { take } from './saga/effects.js';

async function getInfo(){
    let result = await new Promise(resolve => setTimeout(() => {
      resolve(333);
    }, 2000))
    return result;
}

async function getInfo2(arg){
  let result = await new Promise(resolve => setTimeout(() => {
    resolve(arg);
  }, 3000));
  return result;
}

async function getInfo3(){
  let result = await new Promise(resolve => setTimeout(() => {
    resolve('getInfo3');
  }, 3000));
  return result;
}

function* sagaTest1() { // worker saga
  const info = yield getInfo();
  const result = yield getInfo2(info);
  console.log(result);
}

function* sagaTest2(){ // worker saga
  const info = yield getInfo3();
  console.log(info);
}

function* pSaga() {  // watcher saga
  yield take('sagaTest1', sagaTest1);
  yield take('sagaTest2', sagaTest2)
}

export default pSaga;