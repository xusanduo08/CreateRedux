import React, { useContext, useReducer } from 'react';
import Context from './context';

function connect(mapStateToProps) {


  return (component) => {
    function reducer(state, action ){
      const {updateCount} = state;
      return {updateCount: updateCount+1}
    }
    function ConnectFunction(){
      const { store, listeners } = useContext(Context);
      const [, dispatch] = useReducer(reducer, {updateCount:0});
      
      listeners.push(() => {
        dispatch({
          type: 'update',
          payload: {}
        })
      });
      return <Context.Consumer>
        {() => {
          return React.createElement(component, { ...mapStateToProps(store.getState()), dispatch: store.dispatch });
        }}
      </Context.Consumer>
    }
    return ConnectFunction;
  }
}

export default connect;