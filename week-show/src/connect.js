import React, {useContext, useEffect, useRef, useState} from 'react';
import Context from './context';
import shallowEqual from './shallowEqual';
import Subscription from './Subscription';

const noop = () => {};
// TODO 支持mapDispatchToProps
// TODO 如果不传mapStateToProps的话则不订阅store
function connect(mapStateToProps){
  mapStateToProps = mapStateToProps || noop;
  return (Component) => {

    function ConnectComponent(ownProps){
      let {store, parentSub} = useContext(Context);
      let [count, setCount] = useState(0);
      const renderProps = useRef(null); // useRef 在整个生命周期都会将计算出来的props保存在自身的.current属性上

      const subscribe = new Subscription(store, parentSub);
      const checkForUpdate = () => {
        let newProps = mapStateToProps(store.getState(), ownProps); // 后续每当store有更新时都会执行比较，根据比较结果选择是否更新组件
        if(!shallowEqual(renderProps.current, newProps)){
          renderProps.current = newProps;
          setCount(prevState => prevState + 1);
          notifyNestSubs(); // 更新完毕后要通知子组件去更新
        } else {
          notifyNestSubs(); // 如果自身不需要更新，则直接去通知子组件更新
        }
      }
      subscribe.onStateChange = checkForUpdate;

      const notifyNestSubs = subscribe.notifyNestListeners.bind(subscribe);

      useEffect(() => {
        let props = mapStateToProps(store.getState(), ownProps);
        
        if(!shallowEqual(renderProps.current, props)){ // 组件初次挂载到页面上时执行一次比较
          renderProps.current = props
          setCount(prevState => prevState + 1);
        }

        subscribe.trySubscribe();
      
      }, [])

      return (
        <Component {...renderProps.current} dispatch={store.dispatch} renderCount={count} />
      )
    }

    return ConnectComponent;
  }
}

export default connect;