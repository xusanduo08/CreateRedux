import effectRunnerMap from './effectRunnerMap';
import {isEND} from './utils/isEND'


// 专门处理iterator
function proc(env, iterator) {
  let def={};
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
        return result.value;
      }
    } catch(e){
      console.error(e)
    }
  }
  
  function runEffect(effect, cb){
    let effectRunner = effectRunnerMap[effect.type];
    effectRunner(env, effect.payload, cb);
  }

}

export default proc;