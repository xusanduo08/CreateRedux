import React from 'react';
import Context from './context';

class Provider extends React.Component{

  render(){
    const {store} = this.props;
    return (
      <Context.Provider value={{store}}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

export default Provider;