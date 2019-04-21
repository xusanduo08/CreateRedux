import React, { useContext } from 'react';
import Context from './context';

function connect(mapStateToProps) {


  return (component) => {
    
    function ConnectFunction(){
      const { store, listeners } = useContext(Context);
      console.log(store.getState())
      listeners.push(this.setState({}));
      return <Context.Consumer>
        {() => {
          return React.createElement(component, { ...mapStateToProps(store.getState()), dispatch: store.dispatch });
        }}
      </Context.Consumer>
    }
    return <ConnectFunction />;
  }
}

export default connect;