import {TAKE, ACTION_CHANNEL} from './effectType';
import {actionChannel} from './channel';


// 专门处理iterator
function proc(iterator, stdChannel) {
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
      runTakeEffect(effect, effect.payload, cb);
    } else if(effect.type === ACTION_CHANNEL){
      runChannelEffect(effect, effect.payload, cb);
    }
  }

  function runTakeEffect(effect, {channel = stdChannel, pattern}, cb){
    channel.take(pattern, cb, TAKE);
  }

  // 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
  /**
   * actionChannel会检测当前taker中有没有接收当前消息的take，没有的话则缓存，等待指定的taker
   */
  function runChannelEffect(effect, {pattern}, cb){
    const channel = actionChannel();
    
    const taker = (action) => {
      stdChannel.take(pattern, taker, ACTION_CHANNEL);
      channel.put(action);
    };
    stdChannel.take(pattern, taker, ACTION_CHANNEL);
    cb(channel);
  }

}

export default proc;