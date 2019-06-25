import { channel } from './channel';
import { TAKE, ACTION_CHANNEL } from './effectType';
import matcher from './matcher';
import {isEND} from './utils/isEND';

function runTakeEffect(env, { channel = env.channel, pattern }, cb) {
  channel.take(cb, matcher(pattern), TAKE);
}

// 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
/**
 * actionChannel会检测当前takers中有没有接收当前消息的takes，没有的话则缓存，等待指定的taker
 */
function runChannelEffect(env, { pattern }, cb) {
  const chan = channel();

  const currCb = (action) => {
    if(!isEND(action)){
      env.channel.take(currCb, matcher(pattern), ACTION_CHANNEL); // 需要一直监听对应的action
    }

    chan.put(action);
  };

  env.channel.take(currCb,matcher(pattern), ACTION_CHANNEL); // stdChannel负责根据action触发对应的操作
  cb(chan);
}

function runPutEffect(env, { channel, action }, cb) {
  channel ? channel.put(action) : env.dispatch(action);
  cb();
}

export default {
  TAKE: runTakeEffect,
  ACTION_CHANNEL: runChannelEffect,
  PUT: runPutEffect
}