import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { counter } from './api';
import { take } from './saga/effects.js';

function* start(action) {
  const m = yield call(counter, action.seconds)
  console.log(m);
  yield put({ type: 'END', payload: { text: 'timer ended' } })
}

function* mySaga() {
  yield takeLatest('START', start);
}

async function getInfo(){
    let result = await new Promise(resolve => setTimeout(() => {
      resolve(333);
    }, 2000))
    return result;
}

function* pSagaTest() {
  const result = yield getInfo();
  console.log(result);
}

function* pSaga() {
  yield take('pSaga', pSagaTest);
}

export default pSaga;