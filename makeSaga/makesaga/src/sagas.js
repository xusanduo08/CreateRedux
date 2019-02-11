import {call, put, takeEvery, takeLatest} from 'redux-saga/effects';
import {counter} from './api';

function * start(action){
    yield call(counter, action.minutes)
}

function* mySaga(){
    yield takeLatest('START_TIMER', start);
}

export default mySaga;