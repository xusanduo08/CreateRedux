import React, { Component } from 'react';

import './App.css';
import { createStore } from 'redux'
import { Provider } from './provider';
import reducer from './reducer';
import Counter from './Counter';
import Name from './Name';


const store = createStore(reducer);


class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          <Counter />
          <Name />
        </Provider>
      </div>
    );
  }
}

export default App;
