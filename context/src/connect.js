import React, { useContext, useReducer, useMemo } from 'react';
import Context from './context';

function connect(mapStateToProps) {
  return (Component) => {
    function reducer(state, action ){
      const {updateCount} = state;
      return {updateCount: updateCount+1}
    }

    // 根据传入的mapToProps和store计算props
    function selectorFactory(store, mapStateToProps){
      return {
        dispatch: store.dispatch,
        ...mapStateToProps(store.getState())
      }
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

      const renderProps = useMemo(()=>{
        return selectorFactory(store, mapStateToProps);
      }, [store.getState()])

      const RenderComponent = useMemo(()=>{
        return <Component {...renderProps} />
      }, [Component, renderProps])

      return RenderComponent
    }
    return ConnectFunction;
  }
}

export default connect;