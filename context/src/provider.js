/***
 * reudx 一种数据流管理方式
 * 数据统一存储到store中
 * 数据的修改使用dispatch方法
 * action表示要进行的修改
 * reduce接收到action，对store中的数据进行修改
 * 组件通过connect()方法连接到store
 * 
 * import {createStore} from 'redux';
 * <Provider store = {createSotre(xxxx)}>
 *  <CustomerComponent></CustomerComponent>
 * </Provider>
 * 
 * 我们要做的是实现Provider组件和Connect方法
 * Provider组件将store放入到上下文中
 * Connect方法将组件与store连接起来，并根据mapStateToProps有选择性的将store中数据以props形式传入到组件中
 * **/

import React from 'react';
import Context from './context';


class Provider extends React.Component {
  constructor(props) {
    super(props);
    const {store} = this.props;
    const listeners = [];
    this.state = {
      store, 
      listeners
    }
    store.subscribe(() => {   // 订阅store
      listeners.forEach(fn => {
        fn();
      })
    })
  }

  render() {
    const defaultVlaue = this.state;
    return (
      <Context.Provider value={{...defaultVlaue}}>
        {this.props.children}
      </Context.Provider>
    )
  }
}


export {Provider};