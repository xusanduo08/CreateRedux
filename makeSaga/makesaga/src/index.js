import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import rootSaga from './sagas';
import sagaMiddleware from './saga/index';

const easySaga = sagaMiddleware();

const store = createStore(reducer, applyMiddleware(easySaga));
easySaga.run(rootSaga);

ReactDOM.render(<Provider store={store}>
    <App />
    </Provider>, document.getElementById('root'));


serviceWorker.unregister();
