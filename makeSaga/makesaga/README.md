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
总结下吧：
* 每次proc都会产生一个mainTask和一个task
* task是本次mainTask和其分支task的集合
* fork产生的task会挂载在parent-task上，parent-task有个queue，专门用来放置其下fork的task
* fork产生的task是可以取消的
* 一个task在终止之前，会等待所有分叉任务终止
* 一个分叉任务aborted，则其主任务也会aborted，其他兄弟分叉任务也会aborted
* task运行后的结果会通过task自身携带的promise的resolve方法传递出去
* 来自子任务的错误会自动冒泡到父任务
* 取消任务时还要取消任务里正在阻塞的effect
* 每个effect都得给自己的cb设置一个cancel方法
* ~~能取消的应该只是能阻塞的effect~~
* 同步的effect也是可以取消的，比如fork
* 已经结束的effect不能取消，已经取消的effect也不能再继续执行
* 根据task树的结构，我们可以知道，取消动作的最底层其实是调用mainTask.cancel()方法

TODO: 整理下取消逻辑

__task__:等待一个或多个fork出来的task完成后再继续下去-----2019/7/14

当前任务出错，会取消其下的所有子任务，但该任务不会执行取消动作

`throw`方法抛出的错误要被内部捕获，前提是必须至少执行过一次`next`方法
`throw`方法被捕获后（代码中有try.catch或者try.finally结构），会附带执行下一条`yield`表达式，也就是说，会附带执行一次`next`方法

```javascript
  function* gen(){
    try{
      yield 3;
      yield 4
    } catch(e){
      console.log(e)
    } finally{
      yield 5
    }
  }

  let it = gen();
  it.next(); // {value: 3, done: false}
  it.throw('err'); // 错误被捕获，输出 err, 同时顺带执行一次next，输出 {value: 5, done: false}
  it.next(); // {value: undefined, done: true}
```javascript

```javascript
// 如果错误没有在函数内部被catch的话，那么在错误被throw后的下次执行next时，错误会抛出，被外部代码捕获
function* gen(){
  try{
    yield 3;
    yield 4
  } finally {
    yield 5
  }
}
let it = gen();
it.next(); // {value: 3, done: false}
it.throw('err'); // {value: 5, done: false}
it.next(); // 出错，err
it.next(); // {value: undefined, done: true}
```javascript