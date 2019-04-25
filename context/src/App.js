import React, { Component } from 'react';

import './App.css';
import { createStore } from 'redux'
import { Provider } from './provider';
import reducer from './reducer';
import List from './List';


const store = createStore(reducer);


class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <List />
        </Provider>
      </div>
    );
  }
}

export default App;
