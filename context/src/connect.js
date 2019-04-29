import React, { useContext, useReducer, useMemo, useRef, useEffect } from 'react';
import Context from './context';
import shallowEqual from './shallowEqual'

function connect(mapStateToProps) {
  return (Component) => {
    function reducer(state, action ){
      const {updateCount} = state;
      console.log(updateCount)
      return {updateCount: updateCount+1}
    }

    // 根据传入的mapToProps和store计算props
    function selectorFactory(dispatch, mapStateToProps){
      let lastProps = null;
      let firstCall = true;
      function handleFirstCall(state){
        lastProps = mapStateToProps(state);
        firstCall = false;
        return {dispatch, ...lastProps}
      }

      function handleSubsequentCall(state){
        let newProps = mapStateToProps(state);
        console.log(shallowEqual(lastProps, newProps))
        if(!shallowEqual(lastProps, newProps)){ // TODO shallowEqual
          lastProps = newProps;
          return {dispatch, ...newProps}
        }
        return {dispatch, ...lastProps}
      }
      function finalSelector(state){
        if(firstCall){
          return handleFirstCall(state)
        } else {
          return handleSubsequentCall(state);
        }
      }
      return (state) =>{
        return finalSelector(state);
      }
    }

    function ConnectFunction(){
      const { store, listeners } = useContext(Context);
      const [, dispatch] = useReducer(reducer, {updateCount:0});
      const renderProps = useRef(null);
      
      useEffect(()=>{
        const selector = selectorFactory(store.dispatch, mapStateToProps);
        const newRenderProps = selector(store.getState());
        console.log(newRenderProps, renderProps.current)
        if(!shallowEqual(newRenderProps, renderProps.current)){
          renderProps.current = newRenderProps
          dispatch({
            type: 'update',
            payload: {}
          })
        }
        listeners.push(() => {
         
          if(!shallowEqual(newRenderProps, renderProps.current)){ // TODO shallowEqual
            renderProps.current = newRenderProps
            dispatch({
              type: 'update',
              payload: {}
            })
          }
        });
      }, [])

      

      const RenderComponent = useMemo(()=>{
        return <Component {...renderProps.current} />
      }, [Component, renderProps.current])

      return RenderComponent
    }
    return ConnectFunction;
  }
}

export default connect;