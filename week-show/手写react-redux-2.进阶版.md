#### 手写react-redux

这次我们基于基础版的代码写一个进阶版的，主要是优化代码，减少组件re-render次数。

写一个例子：

```jsx
// Name.js
import React from 'react';
import connect from './connect';

function Name(props){

  return (
    <div>
      <span> name: {props.name}</span>
      <p>render-count: {props.renderCount}</p>
    </div>
  )
}

export default connect(state => ({name: state.name}))(Name)

// Age.js
import React from 'react';
import connect from './connect';

function Age(props){
  
  return (
    <div>
      <span>age: {props.age}</span>
      <p>render-count: {props.renderCount}</p>
    </div>
  )
}

export default connect(state => ({age: state.age}))(Age)

//App.js
import React from 'react';
import connect from './connect';
import Name from './Name';
import Age from './Age';


function App(props) {
  function changeName(){
    let dispatch = props.dispatch;
    dispatch({
      type:'CHANGE_NAME',
      payload:{
        name: Math.random()
      }
    })
  }

  function changeAge(){
    let dispatch = props.dispatch;
    dispatch({
      type:'CHANGE_AGE',
      payload: {
        age: Math.random()
      }
    })
  }

  return (
    <div className="App">
      <Name />
      <Age />
      <div>
        <button onClick={changeName}>change name</button>
        <button onClick={changeAge}>change age</button>
      </div>
    </div>
  );
}

export default connect((state) => ({...state}))(App);

```

上面的代码中，Name和Age两个组件分别渲染name和age属性，各自从store订阅name和age数据。当我在页面上点击change name按钮改变store中name值时，会发现Age组件也进行了re-render；同样的，当我在页面上点击change age按钮改变store中age值时，Name组件也进行了re-render。这两种情况中，数据没有改变的那个组件完全没必要去re-render，我们需要对其进行优化。

来分析一下connect方法中订阅store的操作：

```jsx
function connect(mapStateToProps){

  return (Component) => {
    function ConnectComponent(){
      let {store} = useContext(Context);
      let [count, setCount] = useState(0);
      useEffect(() => {
        // 这地方，当store中有数据更新时，会全量执行订阅到store上的方法
        // 也就是说，不管我们组件用到的那个数据有没有发生变化，组件都会re-render一次，这显然很浪费性能
        // 那我们是不是可以先比较一下当前组件需要的属性是否有变化再决定是否更新组件？
        // 可以。那么问题又来了，mapStateToProps计算出来的是个对象，对象里面的属性值还可以是对象
        // 对象里面还可以有对象，可以嵌套好多层，总不能一层层循环去比较吧？
        // 当然不能，深比较耗费性能比较高。但又需要进行比较以判断当前组件需要的属性是否发生了变化
        // 为此，我们进行浅比较，只循环比较对象的第一层属性，不会进入到第二层属性去比较
        store.subscribe(() => {
          setCount(prevState => prevState + 1);
        })
      }, [])

      return (
        <Component
          {...mapStateToProps(store.getState())}
          dispatch={store.dispatch}
          renderCount={count}
				/>
      )
    }

    return ConnectComponent;
  }
}
```

来写个浅比较方法：

```javascript
// shallowEqual.js
function is(x, y){
  if(x === y){
    return x !== 0 || y !== 0
  }
  
  return x !== x || y !== y;
}

function shallowEqual(objA, objB){
  if(is(objA, objB)){
    return true;
  }
  if(typeof objA !== 'object' || typeof objB !== 'object'
    || objA === null || objB === null){
    return false
  }
  
  // 如果objA和objB都是对象，且引用地址不一样的话，那么就比较一下第一层属性
  const keys = Object.keys(objA);
  let result = false; // 默认不浅相等
  result = !keys.some(key => { // some 测试是否至少有一个元素可以通过被提供的函数方法
    if(!objB.hasOwnProperty(key)){
      return true;
    } else if(!is(objA[key], objB[key])) {
      return true;
    }
  })
  
  return result;
}

export default shallowEqual;
```



然后我们把shallowEqual应用到connect方法中：

```jsx
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
```



目前的react-redux中依然用了浅比较，又因为浅比较只比较第一层属性，所以我们在写reducer时，如果数据有变化，一定要返回一个新的state，否则页面不会更新。

经过上面的优化后，再回头看开头的例子，可以发现，更新name时，Age组件不会再re-render了。