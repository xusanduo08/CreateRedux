import React, { useContext, useReducer, useMemo, useRef, useEffect } from 'react';
import Context from './context';
import shallowEqual from './shallowEqual'

function connect(mapStateToProps) {
  return (Component) => {
    function reducer(state, action ){
      const {updateCount} = state;
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
  
        if(!shallowEqual(lastProps, newProps)){ // TODO shallowEqual，比较props是否有变化，有的话返回新的props
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
        
        if(!shallowEqual(newRenderProps, renderProps.current)){
          renderProps.current = newRenderProps
          dispatch({
            type: 'update',
            payload: {}
          })
        }
        listeners.push(() => {
          const newRenderProps = selector(store.getState());
          if(!shallowEqual(newRenderProps, renderProps.current)){ // TODO shallowEqual
            renderProps.current = newRenderProps
            dispatch({
              type: 'update',
              payload: {}
            })
          }
        });
      }, []); // 因为只需要订阅一次，所以第二个参数传入一个空数组，确保订阅操作只执行一次，也就是在组件挂载到页面后执行一次

      

      const RenderComponent = useMemo(()=>{
        return <Component {...renderProps.current} />
      }, [Component, renderProps.current])

      return RenderComponent
    }
    return ConnectFunction;
  }
}

export default connect;