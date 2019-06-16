// 一个redux中间件
// saga分两种，一种是worker saga，一种是watcher saga

import channel from './channel';
import proc from './proc';

function sagaMiddlewareFactory (){

  const takers = [];  //放置action和cb
  const stdChannel = channel(takers);
  let runSaga;

  function sagaMiddleware(){
    // 要能把action和对应的操作注册到某个地方保存起来
    // 等发起action时要去这个地方找，看有没有对应的操作，有的话则执行该操作，没有就不做操作。
    // 1.存储action和对应的cb
    // 2.能处理generator，可以自动执行
    // 3.能监听
    
    runSaga = (saga) => {
      let iterator = saga();
      let promise = proc(iterator, stdChannel);
      return promise;
    }

    return next => action => {
      next(action);
      stdChannel.put(action);
    }
    
  }

  sagaMiddleware.run = (saga) => {
    if(!runSaga){
      throw new Error('Before running a Saga, you must mount the Saga middleware on the Store using applyMiddleware');
    }
    return runSaga(saga);
  }

  return sagaMiddleware;
}


export default sagaMiddlewareFactory;