import { call, fork } from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../sagaMiddleware';

test('should not interpret returned effect. fork(()=>effectCreator())', () => { // 不应该包装返回的effect类型
  const middleware = createSagaMiddleware();
  createStore(() => { }, {}, applyMiddleware(middleware));
  const fn = () => null;

  function* genFn() {
    const task = yield fork(() => call(fn));
    return task.toPromise();
  }

  return middleware.run(genFn).toPromise().then(actual => expect(actual).toEqual(call(fn)));

})

test('should interpret returned promise. fork(() => promise)', () => {
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))

  function* genFn() {
    const task = yield fork(() => Promise.resolve('a'))
    return task.toPromise()
  }

  return middleware
    .run(genFn)
    .toPromise()
    .then(actual => {
      expect(actual).toEqual('a')
    })
})

test('should handle promise that resolves undefined properly. fork(() => Promise.resolve(undefined))', () => {
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))

  function* genFn() {
    const task = yield fork(() => Promise.resolve(undefined))
    return task.toPromise()
  }

  return middleware
    .run(genFn)
    .toPromise()
    .then(actual => {
      expect(actual).toEqual(undefined)
    })
})

test('should interpret returned iterator. fork(()=>iterator)', () => {
  const middleware = createSagaMiddleware();
  createStore(()=>{}, {}, applyMiddleware(middleware));

  function* getFn(){
    const task = yield fork(function*(){
      yield 1;
      return 'b'
    })
    return task.toPromise()
  }

  return middleware.run(getFn).toPromise().then(actual => expect(actual).toEqual('b'));
})
