import {call, put, takeEvery, takeLatest} from 'redux-saga/effects';
import {counter} from './api';

function * start(action){
    const m = yield call(counter, action.seconds)
    console.log(m);
    yield put({type: 'END', payload:{text: 'timer ended'}})
}

function* mySaga(){
    yield takeLatest('START', start);
}

export default mySaga;