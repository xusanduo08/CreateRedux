import {TAKE, ACTION_CHANNEL} from './effectType';
import {actionChannel} from './channel';


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
    if(effect.type === TAKE){
      runTakeEffect(env, effect.payload, cb);
    } else if(effect.type === ACTION_CHANNEL){
      runChannelEffect(env, effect.payload, cb);
    }
  }

  function runTakeEffect(env, {channel = env.channel, pattern}, cb){
    channel.take(cb, pattern, TAKE);
  }

  // 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
  /**
   * actionChannel会检测当前taker中有没有接收当前消息的take，没有的话则缓存，等待指定的taker
   */
  function runChannelEffect(env, {pattern}, cb){
    const channel = actionChannel();
    
    const taker = (action) => {
      env.channel.take(taker, pattern, ACTION_CHANNEL);
      channel.put(action);
    };
    env.channel.take(taker, pattern, ACTION_CHANNEL); // stdChannel负责根据action触发对应的操作
    cb(channel);
  }

}

export default proc;