import React, { Component } from 'react';
import {connect} from 'react-redux';
import './App.css';

class App extends Component {
  
  doAsyncWork(){
    this.props.dispatch({
      type:'sagaTest1',
      payload:'sagaTest1'
    })
  }
  
  doWork2(){
    this.props.dispatch({
      type:'sagaTest2',
      payload:'sagaTest2'
    })
  }

  doWork3(){
    this.props.dispatch({
      type:'sagaTest3',
      payload:'sagaTest3'
    })
  }
  
  doWork4(){
    this.props.dispatch({
      type: 'saga test channel',
      payload: 'saga test channel'
    })
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.doAsyncWork.bind(this)} id='btn'>DoAsyncWork</button>
        <button onClick={this.doWork2.bind(this)} id='btn'>doWork2</button>
        <button onClick={this.doWork3.bind(this)} id='btn'>doWork3</button>
        <button onClick={this.doWork4.bind(this)} id='btn'>doWork4</button>
        <p>{this.props.text}</p>
      </div>
    );
  }
}

export default connect(state=>{
  return {text: state.text}
})(App);
