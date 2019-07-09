import { take, cancelled, call, fork } from '../effects';
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

test('saga cancellation: forked children', () => {
  const actual = [];
  const sagaMiddleware = createSagaMiddleware();
  createStore(()=>{}, {}, applyMiddleware(sagaMiddleware));
  let cancelDef = deferred();
  const rootDef = deferred();
  const childAdef = deferred();
  const childBdef = deferred();
  const neverDef = deferred();
  const defs = [deferred(), deferred(), deferred(), deferred()];

  Promise.resolve()
    .then(() => childAdef.resolve('childA resolve'))
    .then(() => rootDef.resolve('root resolve'))
    .then(() => defs[0].resolve('leaf 0 resolve'))
    .then(() => childBdef.resolve('childB resolve')) //
    .then(() => cancelDef.resolve('cancel'))
    .then(() => defs[3].resolve('leaf 3 resolve'))
    .then(() => defs[2].resolve('leaf 2 resolve'))
    .then(() => defs[1].resolve('leaf 1 resolve'))

  function* main(){
    try{
      yield fork(childA);
      actual.push(yield rootDef.promise);
      yield fork(childB);
      yield neverDef.promise;
    } finally{
      if(yield cancelled){
        actual.push('main cancelled');
      }
    }
  }

  function* childA(){
    try{
      yield fork(leaf, 0);
      actual.push(yield childAdef.promise);
      yield fork(leaf, 1)
      yield neverDef.promise;
    } finally{
      if(yield cancelled()){
        actual.push('childA cancelled');
      }
    }
  }

  function* childB(){
    try{
      yield fork(leaf, 2);
      actual.push(yield childBdef.promise);
      yield fork(leaf, 3);
      yield neverDef.promise
    } finally{
      if(cancelled()){
        actual.push('childB cancelled');
      }
    }
  }

  function* leaf(idx){
    try{
      actual.push(yield defs[idx].promise)
    } finally{
      if(yield cancelled()){
        actual.push(`leaf ${idx} cancelled`);
      }
    }
  }

  const task = sagaMiddleware.run(main);
  cancelDef.promise.then(()=>task.cancel());
  const expected = [
    'childA resolve',
    'root resolve',
    'leaf 0 resolve',
    'childB resolve',
    /* cancel */
    'main cancelled',
    'childA cancelled',
    'leaf 1 cancelled',
    'childB cancelled',
    'leaf 2 cancelled',
    'leaf 3 cancelled',
  ]
  return task.toPromise().then(()=>{
    expect(actual).toEqual(expected);
  })
})