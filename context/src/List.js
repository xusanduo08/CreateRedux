import React, { Component } from 'react';
import connect from './connect';


class List extends Component {

  add() {
    this.props.dispatch({ type: 'ADD' })
  }

  render() {
    return <div>
      {this.props.text}<br />
      <button onClick={this.add.bind(this)}>ADD</button>
    </div>
  }
}

export default connect(state => {
  return {text: state.text}
})(List);