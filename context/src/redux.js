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

const Context = React.createContext(null);

class Provider extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const defaultVlaue = { state: this.props.store.getState(), dispatch: this.props.store.dispatch }

    return (
      <Context.Provider value={{...defaultVlaue}}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

function connect(mapStateToProps){

  return (component) => {
    return <Context.Consumer>
      {({state, dispatch}) => {
        console.log(state, dispatch);
        return React.createElement(component, {...mapStateToProps(state), dispatch});
      }}
    </Context.Consumer>
  }
}

export {Provider, connect};