import React from 'react';
import connect from './connect';

function Name(props){

  return (
    <div>
      <span> name: {props.name}</span>
      <p>render-count: {props.renderCount}</p>
    </div>
  )
}

export default connect(state => ({name: state.name}))(Name)