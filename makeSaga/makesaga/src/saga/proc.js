import {TAKE} from './effectType';


// 专门处理iterator
function proc(iterator, channel) {
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
    if(effect.type === TAKE){
      runTakeEffect(effect, cb, channel);
    }
  }

  function runTakeEffect(effect, cb, channel){
    channel.take(effect.pattern, cb, TAKE);
  }

}

export default proc;