import React from 'react';
import './App.css';
import connect from './connect';
import Name from './Name';
import Age from './Age';


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
      <Name />
      <Age />
      <div>
        <button onClick={changeName}>change name</button>
        <button onClick={changeAge}>change age</button>
      </div>
    </div>
  );
}

export default connect((state) => ({...state}))(App);
