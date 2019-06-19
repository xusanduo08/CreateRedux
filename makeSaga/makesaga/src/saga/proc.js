import effectRunnerMap from './effectRunnerMap';

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