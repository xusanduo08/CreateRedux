import React, {useContext, useEffect, useRef, useState} from 'react';
import Context from './context';
import shallowEqual from './shallowEqual';

function connect(mapStateToProps){

  return (Component) => {

    function ConnectComponent(){
      let {store} = useContext(Context);
      let [count, setCount] = useState(0);
      const renderProps = useRef(null); // useRef 在整个生命周期都会将计算出来的props保存在自身的.current属性上

      useEffect(() => {
        let props = mapStateToProps(store.getState());
        
        if(!shallowEqual(renderProps.current, props)){ // 组件初次挂载到页面上时执行一次比较
          renderProps.current = props
          setCount(prevState => prevState + 1);
        }
        store.subscribe(() => {
          let newProps = mapStateToProps(store.getState()); // 后续每当store有更新时都会执行比较，根据比较结果选择是否更新组件
          if(!shallowEqual(renderProps.current, newProps)){
            renderProps.current = newProps;
            setCount(prevState => prevState + 1);
          }
        })
      }, [])
      
      return (
        <Component {...renderProps.current} dispatch={store.dispatch} renderCount={count} />
      )
    }

    return ConnectComponent;
  }
}

export default connect;