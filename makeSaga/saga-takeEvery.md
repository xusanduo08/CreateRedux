#### takeEvery

takeEvery底层调用的是`fork`方法:

```javascript
function takeEvery(patternOrChannel, worker, ...args){
	if(process.env.NODE_ENV !== 'production'){
		validateTakeEffect(takeEvery, patternOrChannel, worker)
	}
	return fork(takeEveryHelper, patternOrChannel, worker, ...args)
}
```

`fork`方法如下：

```javascript
function fork(fnDescriptor, ...args){
    if(process.env.NODE_ENV !== 'production'){
        validateFnDescriptor('fork', fnDescriptor)
    }
    return makeEffect(effectTypes.FORK, getFnCallDescriptor(fnDescriptor, args));
}
```

`getFnCallDescriptor`方法如下：

```javascript
function getFnCallDescriptor(fnDescriptor, args) {
  let context = null
  let fn

  if (is.func(fnDescriptor)) {
    fn = fnDescriptor
  } else {
    if (is.array(fnDescriptor)) {
      ;[context, fn] = fnDescriptor
    } else {
      ;({ context, fn } = fnDescriptor)
    }

    if (context && is.string(fn) && is.func(context[fn])) {
      fn = context[fn]
    }
  }

  return { context, fn, args }
}
```

makeEffect`方法如下：

```javascript
const makeEffect = (type, payload)=>({
	[IO]: true, 
	combinator: false,
	type,
	payload
})
```



假如takeEvery使用场景如下：

```javascript
import { put, takeEvery } from 'redux-saga/effects'

function delay(ms){
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}

function * addAsync(){
    yield delay(1000);
    yield put({type:'ADD'});
}

export default function *(){
    yield takeEvery('ADD_ASYNC', addAsync);
}
```



最终，takeEvery返回的东西如下：

```javascript
{
   @@redux-saga/IO: true,
   combinator: false,
   payload:{
      fn: takeEvery(patternOrChannel, worker),// 指的是takeEveryHelper
      type:'FORK',
      args: ['ADD_ASYNC', f* addAsync{}] // 遇到ADD_ASYNC action之后，执行addAsync方法
   }
}
```

