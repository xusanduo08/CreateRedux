import React, { Component } from 'react';
import {connect} from 'react-redux';
import './App.css';

class App extends Component {
  
  doAsyncWork(){
    this.props.dispatch({type:'CHANNEL_END_TYPE'})
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
  cancelTask(){
    this.props.task.cancel();
  }

  joinTask(){
    this.props.dispatch({
      type:'join saga'
    })
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.doAsyncWork.bind(this)} id='btn'>DoAsyncWork</button>
        <button onClick={this.doWork2.bind(this)} id='btn'>doWork2</button>
        <button onClick={this.doWork3.bind(this)} id='btn'>doWork3</button>
        <button onClick={this.doWork4.bind(this)} id='btn'>doWork4</button>
        <button onClick={this.cancelTask.bind(this)} id='btn'>cancelTask</button>
        <button onClick={this.joinTask.bind(this)} id='btn'>join saga</button>
        <p>{this.props.text}</p>
      </div>
    );
  }
}

export default connect(state=>{
  return {text: state.text}
})(App);
