import { actionChannel } from './channel';
import { TAKE, ACTION_CHANNEL } from './effectType';


function runTakeEffect(env, { channel = env.channel, pattern }, cb) {
  channel.take(cb, pattern, TAKE);
}

// 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
/**
 * actionChannel会检测当前taker中有没有接收当前消息的take，没有的话则缓存，等待指定的taker
 */
function runChannelEffect(env, { pattern }, cb) {
  const channel = actionChannel();

  const taker = (action) => {
    env.channel.take(taker, pattern, ACTION_CHANNEL);
    channel.put(action);
  };
  env.channel.take(taker, pattern, ACTION_CHANNEL); // stdChannel负责根据action触发对应的操作
  cb(channel);
}

function runPutEffect(env, { action }, cb) {
  env.dispatch(action);
  cb();
}

export default {
  TAKE: runTakeEffect,
  ACTION_CHANNEL: runChannelEffect,
  PUT: runPutEffect
}