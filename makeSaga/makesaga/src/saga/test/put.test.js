import {put} from '../effects';
import {channel} from '../channel';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../sagaMiddleware';

test('test put action', () => {
  let sagaMiddleware = createSagaMiddleware();

  const actual = [];
  const spy = () => next => action => {
    actual.push(action);
    next(action);
  }

  createStore(()=>{}, applyMiddleware(sagaMiddleware, spy));

  function * fn(){
    yield put({
      type:'arg0'
    })
    yield put({
      type:'arg1'
    })
  }

  const expected = [{type:'arg0'}, {type:'arg1'}];

  const p = sagaMiddleware.run(fn);

  p.toPromise().then(()=>{
    expect(actual).toEqual(expected);
  })
});

test('test put actions into channel', () => {
  let sagaMiddleware = createSagaMiddleware();
  const buffers = [];

  const chan = channel(buffers);
  function* fn(){
    yield put(chan, 'arg0');
    yield put(chan, 'arg1');
  }
  createStore(() => {}, applyMiddleware(sagaMiddleware));
  let p =  sagaMiddleware.run(fn);

  const expected = ['arg0', 'arg1'];
  p.toPromise().then(() => {
    expect(buffers).toEqual(expected);
  })
});