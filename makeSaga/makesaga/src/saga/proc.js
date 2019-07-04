import effectRunnerMap from './effectRunnerMap';
import {isEND} from './utils/isEND';
import * as is from './utils/is';
import newTask from './task';

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

  let mainTask = { name };
  // TODO
  let task = newTask(env, parentContext, def, name, mainTask, mainCb); // proc返回一个task，表示当前的generator任务
  const executingContext = {
    parentTask: task
  }

  next();
  return task;
  
  function next(arg, isErr){
    try{
      let result;
      if(isErr){
        iterator.throw(arg);
      }else if(isEND(arg)){
        result = {done: true}
      } else {
        result = iterator.next(arg);
      }
      
      if(!result.done){
        runEffect(result.value, next);
      }else {
        mainTask.cont(result.value, isErr);
        return result.value;
      }
    } catch(e){
      console.error(e)
    }
  }
  
  function runEffect(effect, cb){
    if(is.iterator(effect)){
      proc(env, {}, effect, false, cb);
    } else if(is.promise(effect)){
      effect.then(cb, error => {
        cb(error, true);
      })
    } else {
      let effectRunner = effectRunnerMap[effect.type];
      effectRunner(env, effect.payload, cb, executingContext); // effectRunner(env, effect.payload, cb, parentTask);
    }
  }

}

export default proc;