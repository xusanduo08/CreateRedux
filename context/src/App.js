import React, { Component } from 'react';

import './App.css';
import { createStore } from 'redux'
import { Provider } from './provider';
import connect from './connect';
import reducer from './reducer';


const store = createStore(reducer);

class List extends Component {

  add(){
    this.props.dispatch({type: 'ADD'})
  }

  render() {
    return <div>
      {this.props.text}<br />
      <button onClick={this.add.bind(this)}>ADD</button>
    </div>
  }
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          {connect((state) => ({ text: state.text }))(List)}
        </Provider>
      </div>
    );
  }
}

export default App;
