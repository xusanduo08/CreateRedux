import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {pSaga, forkSaga, cancelSaga, joinSaga, joinSagas} from './sagas';
import main from './cancellationSaga';
import callSaga from './callSaga'
import root from './forkJoin';
import sagaMiddleware from './saga/sagaMiddleware';

const easySaga = sagaMiddleware();

const store = createStore(reducer, applyMiddleware(easySaga));
let task = easySaga.run(callSaga);
task.toPromise().then(v => console.log(v));

ReactDOM.render(<Provider store={store}>
    <App task={task} />
    </Provider>, document.getElementById('root'));


serviceWorker.unregister();
