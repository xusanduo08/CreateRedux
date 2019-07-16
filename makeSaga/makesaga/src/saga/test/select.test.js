import { select} from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../sagaMiddleware';

test('select ', ()=>{
  let sagaMiddleware = createSagaMiddleware();
  function reducer(state){
    return {...state}
  }
  createStore(reducer, {name: 'nameA'}, applyMiddleware(sagaMiddleware));

  let actual = [];
  function* mainSaga(){
    actual.push(yield select(state => state.name));
  }
  const task = sagaMiddleware.run(mainSaga);

  const expected = ['nameA']
  task.toPromise().then(() => expect(actual).toEqual(expected));
})
