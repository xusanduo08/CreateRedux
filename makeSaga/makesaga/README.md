重写一个saga

saga是一个redux中间件

使用Generator状态机实现异步操作

1.首先要满足中间件的标准

effect是一个javascript对象，里面包含描述副作用的信息，可以通过yield传达给sagaMiddleware执行。
effect结构如下：
```
{
  payload:{
    channel, // 通道effect会有此参数
    pattern // 字符串，数组，或者函数
  },
  type, // effect类型，比如TAKE，PUT等
  cb, // 回调，当页面发起的action.type满足pattern时会触发
}
```

在redux-saga世界里，所有的effect都必须被yield才会被执行

__yield表达式本身没有返回值__

proc会执行rootSaga，把需要监听的action和对应的回调注册到channel中

take(pattern)
take(channel)
put(action)
put(channel, action)
call(fn, ...args) // 支持普通函数调用


