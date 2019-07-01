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
call(fn, ...args) 仅支持普通函数调用 2019.6.29
TODO: error处理
DONE: 增加了错误处理 2019.6.30

TODO：call可以调用一个generator方法 2019.6.30
DONE：call可以调用generator以及promise 2019.6.30

TODO：call([context, fn], ...args)
DONE：支持 call([context, fn/fnName]) 2019.6.30

TODO：fork
一个generator下可以有好多个子generator，也就是分支（fork），需要有这么一个体系去记录下应用中的这些generator之间的关系
主generator，子generator，子下面还可以有孙generator，通过generator之间的父子关系，将整个应用的generator关联起来（像个二叉树）

使用task表示一个generator的运行
每个task都有一个queue队列，用来放置fork产生的子task，也就是说当前的task产生了一个分叉
fork产生的每个proc都会产生一个task，而每个task都会有一个父task，子task会处于父task的queue中
