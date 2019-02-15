import React, { Component } from 'react';
import logo from './logo.svg';
import {connect} from 'react-redux';
import './App.css';
import sagaEvent from './saga-event';

class App extends Component {
  constructor(){
    super();
    this.doAsyncWork = this.doAsyncWork.bind(this);
  }
  doAsyncWork(){
    this.props.dispatch({type:'START', seconds: 2000})
  }
  componentDidMount(){
    sagaEvent('btn')
  }
  render() {
    return (
      <div className="App">
        <button onClick={this.doAsyncWork} id='btn'>DoAsyncWork</button>
        <p>{this.props.text}</p>
      </div>
    );
  }
}

export default connect(state=>{
  return {text: state.text}
})(App);
