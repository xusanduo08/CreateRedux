import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {createStore} from 'redux'
import {Provider, connect} from './redux';
import reducer from './reducer';


const store = createStore(reducer);

class List extends Component{
  constructor(props){
    super(props);
  }
  render(){
    return <div>{this.props.text}</div>
  }
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <Provider store={store}>
          {connect((state) => ({text: state.text}))(List)}
        </Provider>
      </div>
    );
  }
}

export default App;
