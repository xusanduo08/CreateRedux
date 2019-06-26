import React from 'react';
import './App.css';
import connect from './connect'

function App(props) {

  function changeName(){
    let dispatch = props.dispatch;
    dispatch({
      type:'CHANGE_NAME',
      payload:{
        name: Math.random()
      }
    })
  }

  function changeAge(){
    let dispatch = props.dispatch;
    dispatch({
      type:'CHANGE_AGE',
      payload: {
        age: Math.random()
      }
    })
  }

  return (
    <div className="App">
      <p>name: <span>{props.name}</span></p>
      <p>age: <span>{props.age}</span></p>
      <p>render-count: <span>{props.renderCount}</span></p>
      <div>
        <button onClick={changeName}>change name</button>
        <button onClick={changeAge}>change age</button>
      </div>
    </div>
  );
}

export default connect((state) => ({...state}))(App);
