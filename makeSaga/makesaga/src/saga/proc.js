import effectRunnerMap from './effectRunnerMap';
import {isEND} from './utils/isEND';
import * as is from './utils/is';
import newTask from './task';
import { CANCELLED, RUNNING, ABORTED } from './taskStatus';

const noop = ()=>{};

// 专门处理iterator
function proc(env, parentContext, iterator, isRoot, mainCb, name) { // mianCb 为当前Generator执行完毕后父级Generator需要继续执行的方法
  let def={};
  mainCb = mainCb || noop;
  let promise = new Promise((resolve, reject) => {
    def.resolve = resolve;
    def.reject = reject;
  }).catch(e => console.log(e))
  def.promise = promise;

  let mainTask = { name, status: RUNNING };
  
  mainTask.cancel = function(){
    if(mainTask.status === RUNNING){
      mainTask.status = CANCELLED
      next('cancel_task'); 
    }
  }

  let task = newTask(env, parentContext, def, name, mainTask, mainCb); // proc返回一个task，表示当前的generator任务
  const executingContext = {
    parentTask: task
  }

  mainCb.cancel = task.cancel // 附加取消逻辑，这样取消操作可以传递到子effect中
  next();
  return task;
  
  function next(arg, isErr){
    try{
      let result;
      // TODO is shouldCancel
      if(arg === 'cancel_task'){
        mainTask.status = CANCELLED;

        // 取消当前的effect
        next.cancel();
        
        // 调用generator的return方法结束generator，在结束之前代码会自动跳到finally中
        result = is.func(iterator.return) ? iterator.return('cancel_task') : {value: 'cancel_task', done: true};
      } else if(isErr){
        result = iterator.throw(arg);
      }else if(isEND(arg)){
        result = {done: true}
      } else {
        result = iterator.next(arg);
      }
      
      if(!result.done && !isErr){
        digestEffect(result.value, next);
      }else if(isErr) {
        mainTask.cont(arg, isErr);
        return result.value;
      } else {
        mainTask.cont(result.value, isErr);
        return result.value;
      }
    } catch(e){
      console.error(e)
      mainTask.status = ABORTED;
      mainTask.cont(e, true);
    }
  }
  
  function runEffect(effect, currCb){
    // TODO 处理cb的cancel方法，需要在effectRunner设置cb.cancel=method方法
    currCb.cancel = noop;
    if(is.iterator(effect)){
      proc(env, {}, effect, false, currCb);
    } else if(is.promise(effect)){
      effect.then(currCb, error => {
        currCb(error, true);
      })
    } else if(effect && effect.type) {
      let effectRunner = effectRunnerMap[effect.type];
      effectRunner(env, effect.payload, currCb, executingContext); // effectRunner(env, effect.payload, cb, parentTask);
    } else {
      currCb(effect);
    }
  }

  function digestEffect(effect, cb){
    let settled; // 是否已经完成或者取消

    function currCb(res, isErr){ // 真正传入effectRunner方法中的回调，effectRunner会对该方法设置cancel方法
      if(settled){
        return
      }
      settled = true;
      cb.cancel = noop;
      cb(res, isErr);
    }
    currCb.cancel = noop;
    cb.cancel = ()=>{
      if(settled){
        return
      }
      settled = true;
      currCb.cancel();
      currCb.cancel = noop;
    }
    runEffect(effect, currCb);
  }

}

export default proc;