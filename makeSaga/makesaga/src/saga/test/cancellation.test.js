import { take, cancelled, call } from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../sagaMiddleware';
import deferred from '../utils/deferred';

test('saga cancellation: take effect', () => {
  let actual = [];
  let startDef = deferred();
  let cancelDef = deferred();
  const sagaMiddleware = createSagaMiddleware();
  const store = applyMiddleware(sagaMiddleware)(createStore)(()=>{});

  function * main(){
    actual.push(yield startDef.promise);
    try{
      actual.push(yield take('action'));
    } finally{
      if(yield cancelled()){
        actual.push('cancelled');
      }
    }
  }

  const task = sagaMiddleware.run(main);
  cancelDef.promise.then(v => {
    actual.push(v);
    task.cancel();
  })
  Promise.resolve(1)
    .then(()=> startDef.resolve('start'))
    .then(()=> cancelDef.resolve('cancel'))
    .then(() => {
      store.dispatch('action')
    })
  const expected = ['start', 'cancel', 'cancelled'];
  task.toPromise().then(() => expect(actual).toEqual(expected));
})

test('saga cancellation: call effect', () => {
  let actual = [];
  const sagaMiddleware = createSagaMiddleware();
  createStore(()=>{}, {}, applyMiddleware(sagaMiddleware));
  let startDef = deferred();
  let cancelDef = deferred();
  let subroutineDef = deferred();

  function * main(){
    actual.push(yield startDef.promise);

    try{
      actual.push(yield call(subroutine));
    } finally{
      if(yield cancelled()){
        actual.push('cancelled');
      }
    }
  }

  function* subroutine(){
    actual.push(yield 'subroutine start');

    try{
      actual.push(yield subroutineDef.promise)
    } finally {
      if(yield cancelled()){
        actual.push(yield 'subroutine cancelled');
      }
    }
  }

  Promise.resolve(1)
    .then(startDef.resolve('start'))
    .then(cancelDef.resolve('cancel'))
    .then(subroutineDef.resolve('subroutine'))

  const task = sagaMiddleware.run(main);
  cancelDef.promise.then(v => {
    actual.push(v);
    task.cancel();
  })

  const expected = ['start', 'subroutine start', 'cancel', 'subroutine cancelled', 'cancelled'];
  return task.toPromise().then(()=>{
    expect(actual).toEqual(expected);
  })

})