import React, { Component } from 'react';
import connect from './connect';


class Name extends Component {

  change(){
    this.props.dispatch({ type: 'RENAME' })
  }

  render() {
    return <div>
      {this.props.name}<br />
      <button onClick={this.change.bind(this)}>Rename</button>
    </div>
  }
}

export default connect(state => {
  return {name: state.name}
})(Name);