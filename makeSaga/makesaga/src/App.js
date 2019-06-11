import React, { Component } from 'react';
import logo from './logo.svg';
import {connect} from 'react-redux';
import './App.css';

class App extends Component {
  
  doAsyncWork(){
    this.props.dispatch({
      type:'pSaga'
    })
  }
  
  doWork2(){
    this.props.dispatch({
      type:'getInfo2'
    })
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.doAsyncWork.bind(this)} id='btn'>DoAsyncWork</button>
        <button onClick={this.doWork2.bind(this)} id='btn'>doWork2</button>
        <p>{this.props.text}</p>
      </div>
    );
  }
}

export default connect(state=>{
  return {text: state.text}
})(App);
