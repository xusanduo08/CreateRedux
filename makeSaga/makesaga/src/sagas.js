
import { take, actionChannel, put, call, fork, cancelled, join } from './saga/effects.js';

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

function* forkSaga(){
  const fn = ()=>null;
  const task = yield fork(()=>call(fn));
  console.log(task.toPromise())
  return task.toPromise()
}

function* cancelSaga(){
  let result = [];
  result.push(yield 'start action');
  try{
    yield take('action');
  } finally{
    if(yield cancelled()){
      result.push('cancelled');
      console.log(result);
    }
  }
  
}

function * joinSaga(){
  let actual = [];
  let task= yield fork(function*(){
    let result = yield take('join saga');
    return result;
  })
  actual.push(yield join(task));
  console.log(actual);
}

export {pSaga, forkSaga, cancelSaga, joinSaga}