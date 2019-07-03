import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {pSaga, forkSaga} from './sagas';
import sagaMiddleware from './saga/sagaMiddleware';

const easySaga = sagaMiddleware();

const store = createStore(reducer, applyMiddleware(easySaga));
let task = easySaga.run(forkSaga);

task.toPromise().then(actual => {
  console.log(actual);
});

ReactDOM.render(<Provider store={store}>
    <App />
    </Provider>, document.getElementById('root'));


serviceWorker.unregister();
