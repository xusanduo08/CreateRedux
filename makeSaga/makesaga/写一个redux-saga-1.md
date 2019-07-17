#### Saga结构

saga使用方法：

```javascript
let sagaMiddleware = createSagaMiddleware();
createStore(reducers, {}, applyMiddleware(sagaMiddleware));

function* rootSaga(){
	yield take('action-A');
}
sagaMiddleware.run(rootSaga)
```

所有一切的入口就在这一句：

```javascript
sagaMiddleware.run(rootSaga)
```

一句话：`run()`方法启动saga



saga结构大致有以下几个部分：

* run：程序入口，将action传递到下一个中间件，同时启动rootSaga，并将rootSaga执行后返回的iterator传递给proc继续执行

* proc：主要部分，用来执行Generator运行后产生的Iterator，负责触发iterator.next()，并根据每次执行返回的结果选择对应的runner来处理。

* task：proc方法运行后的返回值，代表一次saga任务。

* effects（位于io.js文件中）：定义用来产生effect的方法，例如我们用的`take`，`put`等方法，这些方法返回的结果都是一个effect。
* effectRunner（位于effectRunnerMap.js文件中）：这部分定义了用来执行每种类型effect的方法，例如，`take()`操作产生的effect需要`takeEffectRunner()`方法来执行
* channel（位于channel.js文件中）：通道定义文件，通道可用于在saga之间通信，也可以用来缓存消息
* forkQueue（位于forkQueue.js文件中）：定义了管理fork task的队列，`fork()`方法会创建另一个task，产生的task会由forkQueue来管理
* util（位于utils.js文件中）：定义了一些工具方法



我们定义一个工厂函数：sagaMiddlewareFactory，用来创建saga中间件。

```javascript

function sagaMiddlewareFactory(){

	function sagaMiddleware({getState, dispatch}){
		
		return next => action => {
			next(action);
			/**TODO action经过我们的中间件*/
		}
	}
    
    sagaMiddleware.run = (saga) => {
        // 启动saga
    }
    
    return sagaMiddleware
}
```

上面是`sagaMiddlewareFactory`的大概样子。

saga中间件在获取到action后，需要决定是否要采取相应的动作，因此事先我们需要将action以及需要采取的动作注册到saga中间件某处-----将action以及需要采取的动作注册到channel中。（个人理解：想象一下action从管道中流过，管道中有相同action的话就会被击中，对应的操作就会被触发）





