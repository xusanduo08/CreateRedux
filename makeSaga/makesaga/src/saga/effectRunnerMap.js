import { channel } from './channel';
import { TAKE, ACTION_CHANNEL } from './effectType';
import matcher from './matcher';
import { isEND } from './utils/isEND';
import * as is from './utils/is';
import proc from './proc';

// effectRunnerMap统一catch错误，出现错误后调用cb(err, true)，交给下一次next执行

function runTakeEffect(env, { channel = env.channel, pattern }, cb) {
  try{
    channel.take(cb, matcher(pattern), TAKE);
  } catch(e){
    cb(e, true);
  }
}

// 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
/**
 * actionChannel会检测当前takers中有没有接收当前消息的takes，没有的话则缓存，等待指定的taker
 */
function runChannelEffect(env, { pattern }, cb) {
  const chan = channel();

  const currCb = (action) => {
    if (!isEND(action)) {
      env.channel.take(currCb, matcher(pattern), ACTION_CHANNEL); // 需要一直监听对应的action
    }

    chan.put(action);
  };
  try {
    env.channel.take(currCb, matcher(pattern), ACTION_CHANNEL); // stdChannel负责根据action触发对应的操作
    cb(chan);
  } catch (e) {
    cb(e, true);
  }

}

function runPutEffect(env, { channel, action }, cb) {
  try {
    channel ? channel.put(action) : env.dispatch(action);
    cb();
  } catch (e) {
    cb(e, true);
  }
}

function runCallEffect(env, {context, fn, args }, cb) {
  try {
    const result = fn.apply(context, args);
    if(is.iterator(result)){
      return proc(env, result, false, cb);
    } else if(is.promise(result)){
      result.then(cb, error => {
        cb(error, true);
      })
      return
    }
    cb(result);
  } catch (e) {
    cb(e, true)
  }
}

export default {
  TAKE: runTakeEffect,
  ACTION_CHANNEL: runChannelEffect,
  PUT: runPutEffect,
  CALL: runCallEffect
}