import { actionChannel } from './channel';
import { TAKE, ACTION_CHANNEL } from './effectType';
import * as is from './utils/is';

//TODO 抽离matcher
// TODO 整理参数，标准化参数，文档
function matcher(pattern='*'){
  const createMatcher = (pattern === '*' ? ()=> ()=> true : 
    is.func(pattern) ? pattern => input => pattern(input) : 
    is.array(pattern) ? pattern => input => pattern.indexOf(input) >= 0 :
    is.string(pattern) ?  pattern => (input)=>input === pattern : null);

  return createMatcher(pattern);
}

function runTakeEffect(env, { channel = env.channel, pattern }, cb) {
  channel.take(cb, matcher(pattern), TAKE);
}

// 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
/**
 * actionChannel会检测当前taker中有没有接收当前消息的take，没有的话则缓存，等待指定的taker
 */
function runChannelEffect(env, { pattern }, cb) {
  const channel = actionChannel();

  const taker = (action) => {
    env.channel.take(taker, matcher(pattern), ACTION_CHANNEL);
    channel.put(action);
  };

  env.channel.take(taker,matcher(pattern), ACTION_CHANNEL); // stdChannel负责根据action触发对应的操作
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