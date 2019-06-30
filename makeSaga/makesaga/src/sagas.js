
import { take, actionChannel, put, call } from './saga/effects.js';

function cal(a, b) {
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve(222);
    }, 1000)
  });
}

function* it(){
  let result = yield take('sagaTest2');
  return result;
}

function* pSaga() {  // watcher saga
  let result = [];
  const obj = {
    printAge: function(){
      return (this.age)
    },
    age: 23
  }
  result.push(yield call([obj, obj.printAge]));
  result.push(yield call(cal));
  result.push(yield it());
  result.push(yield cal());
  console.log(result);
}

export default pSaga;