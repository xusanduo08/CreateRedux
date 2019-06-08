#### run方法

一般saga使用方法如下：

```javascript
const saga = createSagaMiddleware();
const store = createStore(reducer, { count: 0 }, applyMiddleware(saga));
saga.run(rootSaga);
```

假设rootSaga如下：

```javascript
function *(){
    console.log(takeEvery)
    yield takeEvery('ADD_ASYNC', addAsync);
}
```

来分析一下`saga.run()`的调用过程.

`saga.run()`即为`boundRunSaga`：

```javascript
boundRunSaga = runSaga.bind(null, {
	...options, 
	context,
	channel,
	dispatch,
	getState,
	sagaMonitor
})
```

`saga.run(rootSaga)`即为`boundRunSaga(rootSaga)`。

进入到`runSaga`方法里就是：

```javascript
function runSaga(
  { channel = stdChannel(), dispatch, getState, context = {}, sagaMonitor, effectMiddlewares, onError = logError },
  saga,
  ...args
) {
  const iterator = saga(...args)
  const effectId = nextSagaId()

  let finalizeRunEffect
  if (effectMiddlewares) {
    const middleware = compose(...effectMiddlewares)
    finalizeRunEffect = runEffect => {
      return (effect, effectId, currCb) => {
        const plainRunEffect = eff => runEffect(eff, effectId, currCb)
        return middleware(plainRunEffect)(effect)
      }
    }
  } else {
    finalizeRunEffect = identity
  }

  const env = {
    channel,
    dispatch: wrapSagaDispatch(dispatch),
    getState,
    sagaMonitor,
    onError,
    finalizeRunEffect,
  }

  return immediately(() => {
    const task = proc(env, iterator, context, effectId, getMetaInfo(saga), /* isRoot */ true, noop)

    if (sagaMonitor) {
      sagaMonitor.effectResolved(effectId, task)
    }
    return task
  })
}
```

所以真正运行的是`runSaga({xxx}, rootSaga)`， `rootSaga`即对应`runSaga`的第二个形参saga。

在`runSaga()`中，`rootSaga`得到执行，因为`rootSaga`本身是一个generator方法，所以运行后得到一个迭代器：

```javascript
const iterator = saga(...args)
```

接下来`runSaga()`直接返回一个即时执行函数，在这个函数中，`iterator`被传入到`proc()`方法中继续处理。

进入到`proc()`方法中。`proc()`中定义了三个内部方法:`next()`、`runEffect()`、`digestEffect()`。进入到`proc()`内部后先执行一次`next()`方法：

```javascript
function next(arg, isErr) {
    try {
      let result
      if (isErr) {
       // ...
      } else {
        result = iterator.next(arg) // 执行一次迭代器
      }

      if (!result.done) { // 如果迭代器没有结束，则将result.value传入digestEffect执行
        digestEffect(result.value, parentEffectId, next)
      } else {
      	//...
      }
    } catch (error) {
      //...
    }
  }

```

在我们的示例中，`result.value`的值如下：

```javascript
{
   @@redux-saga/IO: true,
   combinator: false,
   payload:{
      fn: takeEvery(patternOrChannel, worker),// takeEveryHelper
      type:'FORK',
      args: ['ADD_ASYNC', f* addAsync{}]
   }
}
```



在`digestEffect()`内部，传入的`effect`也就是`result.value`会被传入`finalEunEffect()`继续执行。

`finalRunEffect(effect, effectId, currCb)`最终是`runEffect(effect, effectId, currCb)`：

```javascript
function runEffect(effect, effectId, currCb) {
    if (is.promise(effect)) {
      resolvePromise(effect, currCb)
    } else if (is.iterator(effect)) {
      proc(env, effect, task.context, effectId, meta, /* isRoot */ false, currCb)
    } else if (effect && effect[IO]) {
      const effectRunner = effectRunnerMap[effect.type]
      effectRunner(env, effect.payload, currCb, executingContext)
    } else {
      currCb(effect)
    }
  }
```

因为我们的示例中，传入的`effect`并不是个迭代器，所以最终运行的是：

```javascript
const effectRunner = effectRunnerMap[effect,type]
effectRuner(env, effect.payload, currcb, executingContext);
```

fork类型的runner如下：

```javascript
function runForkEffect(env, { context, fn, args, detached }, cb, { task: parent }) {
  const taskIterator = createTaskIterator({ context, fn, args })
  const meta = getIteratorMetaInfo(taskIterator, fn)

  immediately(() => {
    const child = proc(env, taskIterator, parent.context, currentEffectId, meta, detached, noop)

    if (detached) {
      cb(child)
    } else {
      if (child.isRunning()) {
        parent.queue.addTask(child)
        cb(child)
      } else if (child.isAborted()) {
        parent.queue.abort(child.error())
      } else {
        cb(child)
      }
    }
  })
  // Fork effects are non cancellables
}
```



看下`createTaskIterator()`:

```javascript
function createTaskIterator({ context, fn, args }) {
  try {
    const result = fn.apply(context, args)
    if (is.iterator(result)) {
      return result
    }

    let resolved = false

    const next = arg => {
      if (!resolved) {
        resolved = true
        return { value: result, done: !is.promise(result) }
      } else {
        return { value: arg, done: true }
      }
    }

    return makeIterator(next)
  } catch (err) {
    //...
  }
}
```

`createTaskIterator()`中，`context`和`args`被传入到`fn`中执行了一次。`fn`为`takeEveryHelper()`方法，`context`为`null`，`args`为`['ADD_ASYNC', f* addAsync{}]`。

`takeEveryHelper()`如下：

```javascript
function takeEvery(patternOrChannel, worker, ...args) {
  const yTake = { done: false, value: take(patternOrChannel) }
  const yFork = ac => ({ done: false, value: fork(worker, ...args, ac) })

  let action,
    setAction = ac => (action = ac)

  return fsmIterator(
    {
      q1() {
        return { nextState: 'q2', effect: yTake, stateUpdater: setAction }
      },
      q2() {
        return { nextState: 'q1', effect: yFork(action) }
      },
    },
    'q1',
    `takeEvery(${safeName(patternOrChannel)}, ${worker.name})`,
  )
}
```

`fsmIterator()`返回一个带有`next`属性的类iterator对象：

```javascript
{
	isSagaIterator: true,
	meta:{
		name:"takeEvery(ADD_ASYNC, addAsync)"
	},
	next: function next(arg, error) {
            if (nextState === qEnd) {
              return done(arg)
            }
            if (error && !errorState) {
              nextState = qEnd
              throw error
            } else {
              stateUpdater && stateUpdater(arg)
              const currentState = error ? fsm[errorState](error) : fsm[nextState]();
              ({ nextState, effect, stateUpdater, errorState } = currentState)
              return nextState === qEnd ? done(arg) : effect
         },
    return: ,
    throw: ，
    Symbol(Symbol.iterator): ()=>iterator
   
}
```

然后继续到`proc()`中去执行。

`takeEvery()`返回的Iterator执行一次后返回的effect的类型为take，继续走take的runner方法，也就是将patternOrChannel注册到channel中，take的cb参数为proc中的next方法。

 

（了解take的使用）



