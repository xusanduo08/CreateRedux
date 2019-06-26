import React from 'react';
import connect from './connect';

function Age(props){
  
  return (
    <div>
      <span>age: {props.age}</span>
      <p>render-count: {props.renderCount}</p>
    </div>
  )
}

export default connect(state => ({age: state.age}))(Age)