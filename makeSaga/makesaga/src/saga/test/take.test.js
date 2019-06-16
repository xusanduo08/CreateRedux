import {take} from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../index';


test('test take', () => {
  
  let sagaMiddleware = createSagaMiddleware();
  let store = createStore(() => {}, applyMiddleware(sagaMiddleware));

  let actual = [];
  function* fn(){
    try{
      actual.push(yield take()); // take all acitons
      actual.push(yield take('saga test1'));
      actual.push(yield take('saga test2'));
      actual.push(yield take('saga test3'));
      actual.push(yield take('saga test4')); // 如果某一个action一直没有触发的话，会自动END么
    } finally{
      actual.push({type:'auto ended'});
    }
  }

  let promise = sagaMiddleware.run(fn);

  let expected = [
    {type: 'action-*'},
    {type:'saga test1'},
    {type:'saga test2'},
    {type:'saga test3'},
    {type:'saga test4'},
    {type:'auto ended'}
  ]
  let dispatchP = Promise.resolve(1)
    .then(() => store.dispatch({type:'action-*'}))
    .then(() => store.dispatch({type:'saga test1'}))
    .then(() => store.dispatch({type:'saga test2'}))
    .then(() => store.dispatch({type:'saga test3'}))
    .then(() => store.dispatch({type:'saga test4'}))
    .then(() => expect(actual).toEqual(expected))

  return Promise.all([promise, dispatchP]);
  
})