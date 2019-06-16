import {take} from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../index';


test('test take', () => {
  
  let sagaMiddleware = createSagaMiddleware();
  let store = createStore(() => {}, applyMiddleware(sagaMiddleware));

  let actual = [];
  function* fn(){
    actual.push(yield take('saga test1'));
    actual.push(yield take('saga test2'));
    actual.push(yield take('saga test3'));
  }

  let promise = sagaMiddleware.run(fn);

  let expected = [
    {type:'saga test1'},
    {type:'saga test2'},
    {type:'saga test3'}
  ]
  let dispatchP = Promise.resolve(1)
    .then(() => store.dispatch({type:'saga test1'}))
    .then(() => store.dispatch({type:'saga test2'}))
    .then(() => store.dispatch({type:'saga test3'}))
    .then(() => store.dispatch({type:'saga test4'}))

  return Promise.all([promise, dispatchP]).then(()=>expect(actual).toEqual(expected));
  
})