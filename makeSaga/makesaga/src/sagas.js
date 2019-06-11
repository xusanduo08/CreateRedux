import { call, put, takeEvery, takeLatest } from 'redux-saga/effects';
import { counter } from './api';
import { take } from './saga/effects.js';

async function getInfo(){
    let result = await new Promise(resolve => setTimeout(() => {
      resolve(333);
    }, 2000))
    return result;
}

async function getInfo2(arg){
  let result = await new Promise(resolve => setTimeout(() => {
    resolve(arg);
  }, 3000));
  return result;
}

async function getInfo3(arg){
  let result = await new Promise(resolve => setTimeout(() => {
    resolve(arg);
  }, 3000));
  return result;
}

function* pSagaTest() {
  const info = yield getInfo();
  const result = yield getInfo2(info);
  console.log(result);
}

function* sagaTest(){
  const info = yield getInfo3();
  console.log(info);
}

function* pSaga() {
  yield take('pSaga', pSagaTest);
  yield take('getInfo2', sagaTest)
}

export default pSaga;