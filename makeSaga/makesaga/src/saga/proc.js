import {TAKE, ACTION_CHANNEL} from './effectType';
import effectRunnerMap from './effectRunnerMap';

// 专门处理iterator
function proc(iterator, env) {
  let def={};
  next();
  return new Promise((resolve, reject) => {
    def.resolve = resolve;
    def.reject = reject;
  }).catch(e => console.log(e))
  
  function next(arg){
    let {value, done} = iterator.next(arg);
    if(!done){
      runEffect(value, next);
    }else {
      def.resolve(1);
      return value;
    }
  }
  
  function runEffect(effect, cb){
    let effectRunner = effectRunnerMap[effect.type];
    effectRunner(env, effect.payload, cb);
  }

}

export default proc;