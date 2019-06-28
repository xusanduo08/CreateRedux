#### 手写一个react-redux

store/action/dispatch都是redux里的概念

react-redux就是将redux的这些东西和react结合起来，使我们能够在react中使用store/action/dispatch这些东西

我们一般都是这么使用的：

```jsx
class App extends React.Component{}
export default connect(mapStateToProps, mapDispatchToProps)(App);

<Provider store={store}>
	<App /> 
</Provider>

```

* store以props形式传给Provider组件
* 页面根组件会放在Provider组件内部渲染
* 最终导出的组件是被connect方法处理后的组件，处理后的组件可以获取store中存储的数据state
* 可以通过mapStateToProps将state处理或者说筛选过后再传给组件



上面几个功能我们来实现一下。

Provider组件主要功能是把store放到上下文中，让内部子组件可以随意获取这个上下文，先来创建一个公共的上下文：

```jsx
// Context.js
import React from 'react';

const Context = React.createContext(null);
export default Context;
```



然后我们用创建好的上下文来创建Provider：

```jsx
// Provider.js
import React from 'react';
import Context from './Context.js';

class Provider extends React.Component{
  
  render(){
    const {store} = this.props; // 从props中读取store，然后放到上下文中
    return (
      <Context.Provider value={{store]}}>
      	{this.props.children}
      </Context.Provider>
    )
  }
}
```

Provider就这些，下面来写connect方法。

connect方法要将组件订阅到store上，这样state更新时，组件能够自动re-render。另外，connect方法还得能根据传入的mapStateToProps将state中的数据处理后传给组件。

```jsx
// connect.js
import React, {useContext, useEffect, useState} from 'react';
import Context from './context';

function connect(mapStateToProps){
  
  return (Component) => {
    function ConnectComponent(){
      let {store} = useContext(Context);
      let [count, setCount] = useSstate(0);
      
      useEffect(() => {
        store.subscribe(() => {
          setState(prevCount => prevCount + 1); // 当store更新时，会执行订阅到它上面的方法
        })
      }, []);
      
      return (
      	<Component {...mapStateToProps(store.getState())}
          dispatch={store.dispatch}
          renderCount={count}
         />
      )
    }
  }
}
```



