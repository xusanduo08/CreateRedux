import React, { Component } from 'react';
import connect from './connect';

class Name extends Component {
  constructor(props){
    super(props);
    this.state = {
      inputDom: null
    }
  }

  change(){
    this.props.dispatch({ type: 'RENAME', payload:this.inputDom.value })
  }

  bindInput(dom){
    this.inputDom = dom;
  }

  render() {
    return <div>
      {this.props.name}<br />
      <label>
        Name:<input ref={this.bindInput.bind(this)} />
      </label>
      <button onClick={this.change.bind(this)}>Rename</button>
    </div>
  }
}

export default connect(state => {
  return {name: state.name}
})(Name);