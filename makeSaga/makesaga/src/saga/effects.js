import { TAKE, ACTION_CHANNEL, PUT } from './effectType';
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

export function put(action) { // 向store发起一个action，非阻塞, put({type:xxx, payload})
  return {
    payload:{ action },
    type: PUT
  }
}