import effectRunnerMap from './effectRunnerMap';
import {isEND} from './utils/isEND';
import * as is from './utils/is'

const noop = ()=>{};

// 专门处理iterator
function proc(env, iterator, isRoot, mainCb) { // mianCb 为当前Generator执行完毕后父级Generator需要继续执行的方法
  let def={};
  mainCb = mainCb || noop;
  let promise = new Promise((resolve, reject) => {
    def.resolve = resolve;
    def.reject = reject;
  }).catch(e => console.log(e))
  next();
  return promise;
  
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
        def.resolve(1);
        mainCb(result.value);
        return result.value;
      }
    } catch(e){
      console.error(e)
    }
  }
  
  function runEffect(effect, cb){
    if(is.iterator(effect)){
      proc(env, effect, false, cb);
    } else {
      let effectRunner = effectRunnerMap[effect.type];
      effectRunner(env, effect.payload, cb);
    }
  }

}

export default proc;