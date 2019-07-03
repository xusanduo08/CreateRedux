import {call, fork} from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../sagaMiddleware';

test('should not interpret returned effect. fork(()=>effectCreator())', () => { // 不应该包装返回的effect类型
  const middleware = createSagaMiddleware();
  createStore(()=> {}, {}, applyMiddleware(middleware));
  const fn = () => null;

  function* genFn(){
    const task = yield fork(()=> call(fn));
    return task.toPromise();
  }

  return middleware.run(genFn).toPromise().then(actual => expect(actual).toEqual(call(fn)));
    
})