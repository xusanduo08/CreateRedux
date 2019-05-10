#### 写一个React-redux

redux是一种数据流管理方式，它将数据统一存储到store中，数据的修改需要使用`dispatch()`方法，同时需要配置reduce用来接受action，action表示要进行的修改，reduce接收到action后会修改store并返回一个全新的store。

我们在使用redux时需要搭配react-redux。react-redux主要作用是协助组件订阅store，通过`connect()`方法来实现组件对store的订阅。

```jsx
class List extends React.Component{}
export default connect(mapStateToProps, mapDispatchToProps)(List)

import List from './List';
import {createStore} from 'redux';

const store = createStore(reducer);

<Provider store={store}>
	<List />
</Provider>
```

我们要做的就是实现`Provider`组件以及`connect`方法。

##### Provider组件的实现

功能点：

* 接收props中的store，并将其放入上下文，供子组件来使用。

实现起来比较简单：

先创建一个统一的上下文：

Context.js:

```jsx
import {createContext} from 'react';
const Context = createContext(null);

export default Context;
```



Provider.js:

```jsx
import React, {createContext} from 'react';

const Context = createContext(null);
class Provider extends React.Component{

	render(){
		return (
			<Context.Provider value={store: this.props.store}>
				{this.props.children}
			</Context.Provider>
		)
	}
}
```



##### connect方法的实现

功能点：

* 将组件订阅到store上
* 根据mapStateToProps将store的数据传给组件
* store发生变化时组件能随之更新

我们只实现一个简单版的，只考虑mapStateToProps。

```jsx
import {useContext, useReducer} from 'react';
import Context from './Context.js';

function connect(mapStateToProps){

  function selector(mapStateToProps, store){ // 计算属性
    return  {...mapStateToProps(store.getState()), dispatch: store.dispatch};
  }
  function reducer(state, action){
    return {updateCount: state.updateCount++};
  }
  
	return (WrapperComponent)=>{
		function ConnectComponent(){
			const {store} = useContext(Context);
      const [, dispatch] = useReducer(reducer, {updateCount: 0});
      
      useEffect(()=>{
        store.subscribe(()=> {
          dispatch({type: 'update'})
        })
      }, [])
      const props = selector(mapStateToProps, store);
			return <WrapperComponent {...props} />
		}
		return ConnectComponent;
	}
}
```

以上就实现了一个非常非常简单的react-redux。