import effectRunnerMap from './effectRunnerMap';
import {isEND} from './utils/isEND'


// 专门处理iterator
function proc(iterator, env) {
  let def={};
  let promise = new Promise((resolve, reject) => {
    def.resolve = resolve;
    def.reject = reject;
  }).catch(e => console.log(e))
  next();
  return promise;
  
  function next(arg){
    let result;
    if(isEND(arg)){
      result = {done: true}
    } else {
      result = iterator.next(arg);
    }
    
    if(!result.done){
      runEffect(result.value, next);
    }else {
      def.resolve(1);
      return result.value;
    }
  }
  
  function runEffect(effect, cb){
    let effectRunner = effectRunnerMap[effect.type];
    effectRunner(env, effect.payload, cb);
  }

}

export default proc;