import { TAKE, ACTION_CHANNEL, PUT } from './effectType';
import is from './utils/is';

export function take(patternOrChannel = '*') { // pattern: action, worker: 工作函数
  // TODO  重写take
  // 实现能阻塞执行，等待执行action后再继续执行
  // 写jest测试用例
  if (is.pattern(patternOrChannel)) {

    return { payload: { pattern: patternOrChannel }, type: TAKE }
  }
  if (is.channel(patternOrChannel)) {
    return { payload: { channel: patternOrChannel }, type: TAKE };
  }

}

export function actionChannel(pattern) {
  return { payload: { pattern }, type: ACTION_CHANNEL };
}

export function put(action) { // 向store发起一个action，非阻塞, put({type:xxx, payload})
  return {
    payload:{ action },
    type: PUT
  }
}