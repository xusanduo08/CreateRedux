import { TAKE, ACTION_CHANNEL, PUT, CALL } from './effectType';
import * as is from './utils/is';

/**
 * effect结构如下
 * {
 *    payload:{   // effect携带的数据
 *      pattern,
 *      channel,
 *     },  
 *    type: xxx, // effect类型
 * } 
 */

export function take(patternOrChannel = '*') { // pattern: action, worker: 工作函数
  if (is.pattern(patternOrChannel)) {
    return { payload: { pattern: patternOrChannel }, type: TAKE }
  }
  if (is.channel(patternOrChannel)) {
    return { payload: { channel: patternOrChannel }, type: TAKE };
  }

}

export function actionChannel(pattern = '*') {
  return { payload: { pattern }, type: ACTION_CHANNEL };
}


// 向store发起一个action，非阻塞, put({type:xxx, payload})
// 或者向指定的channel存入一个action
export function put(channel, action) {
  if(is.undef(action)){
    action = channel;
    channel = undefined;
  }
  return {
    payload:{
      channel,
      action
    },
    type: PUT
  }
}

export function call(fn, ...args){
  return {
    payload:{
      fn,
      args
    },
    type: CALL
  }
}