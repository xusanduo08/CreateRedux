import { take, cancelled } from '../effects';
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