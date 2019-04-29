import React, { Component } from 'react';
import connect from './connect';


class Counter extends Component {

  add() {
    this.props.dispatch({ type: 'ADD' })
  }

  del(){
    this.props.dispatch({ type: 'DEL' })
  }

  render() {
    return <div>
      {this.props.text}<br />
      <button onClick={this.add.bind(this)}>ADD</button>
      <button onClick={this.del.bind(this)}>DEL</button>
    </div>
  }
}

export default connect(state => {
  return {text: state.text}
})(Counter);