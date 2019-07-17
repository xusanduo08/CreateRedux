import { TAKE, ACTION_CHANNEL, PUT, CALL, FORK, CANCELLED, JOIN, CANCEL, SELECT, FLUSH, SET_CONTEXT, GET_CONTEXT, RACE, DELAY, ALL, CPS } from './effectType';
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

export function call(fnDescription, ...args){
  let context = null;
  let fn;
  if(is.func(fnDescription)){
    fn = fnDescription;
  } else if(is.array(fnDescription)){ // call([context, fn], ...args)  或者 call([context, 'fnName'], ...args)
    [context, fn] = fnDescription;
  } else {
    ;({context, fn} = fnDescription)
  }

  if(context && is.string(fn) && is.func(context[fn])){
    fn = context[fn];
  }

  return {
    payload:{
      context,
      fn,
      args
    },
    type: CALL
  }
}

export function fork(fnDescription, ...args){
  let context = null;
  let fn;
  if(is.func(fnDescription)){
    fn = fnDescription;
  } else if(is.array(fnDescription)){ // call([context, fn], ...args)  或者 call([context, 'fnName'], ...args)
    [context, fn] = fnDescription;
  }

  if(context && is.string(fn) && is.func(context[fn])){
    fn = context[fn];
  }

  return {
    payload:{
      context,
      fn,
      args
    },
    type: FORK
  }
}

export function spawn(fnDescription, ...args){
  let eff = fork(fnDescription, ...args);
  return {
    payload: {...eff.payload, detached: true},
    type: FORK
  }
}

export function cancelled(){
  return {payload:{}, type:CANCELLED}
}

export function join(taskOrTasks){ // 等待fork任务的结束
  return {payload:{taskOrTasks}, type: JOIN}
}

export function cancel(taskOrTasks){
  return {payload:{taskOrTasks}, type: CANCEL}
}

export function select(selector, ...args){
  return {payload:{selector, args}, type: SELECT}
}

export function apply(context, fn, ...args){
  if(context && is.string(fn) && is.func(context[fn])){
    fn = context[fn];
  }
  return {
    payload: {
      context,
      fn,
      args
    },
    type: CALL
  }
}

export function flush(channel){
  return {payload:{channel}, type: FLUSH}
}

export function setContext(props){
  return {payload:{ props }, type: SET_CONTEXT}
}

export function getContext(prop){
  return {payload: {prop}, type: GET_CONTEXT}
}

export function race(effects){
  return {
    payload:{effects},
    type: RACE
  }
}

export function delay(time){
  return {payload:{time}, type: DELAY}
}

export function all(effects){
  return {payload:{effects}, type: ALL}
}

export function cps(fnDescription, ...args){
  let context = null;
  let fn;
  if(is.array(fnDescription)){
    [context, fn] = fnDescription
  } else if(is.func(fnDescription)){
    fn = fnDescription;
  }
  if(context && is.string(fn) && is.func(context[fn])){
    fn = context[fn];
  }
  return {
    payload: {
      context,
      fn, 
      args
    },
    type: CPS
  }
}