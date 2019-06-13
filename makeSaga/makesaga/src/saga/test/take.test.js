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

  sagaMiddleware.run(fn);

  let expected = [
    {type:'saga test1'},
    {type:'saga test2'},
    {type:'saga test3'}
  ]
  
  store.dispatch({type:'saga test1'});
  store.dispatch({type:'saga test2'});
  store.dispatch({type:'sage test3'});
  expect(actual).toEqual(expected);
})