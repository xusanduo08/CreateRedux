import {isEND, END} from './utils/isEND';
import remove from './utils/remove';

export const CHANNEL_END = 'CHANNEL_END';
const stdChannel = (takers = []) => {  // 主channel，存储action和对应的操作
  return {
    put: (action) => {  // 发起一个action
      if(isEND(action)){ // 如果发起的是一个END的话，则终止所有saga
        takers.forEach(taker => {
          taker(END);
        })
        takers = [];
        return;
      }
      let currTakers = takers.concat([]); // 防止遍历的时候takers发生变化
      let desTakes = []; // 用来保存已经执行回调的taker的索引，遍历结束后用来过滤takers
      for (let i = 0; i < currTakers.length; i++) {
        let taker = currTakers[i];
        if (taker.matcher(action.type)) {
          desTakes.push(i)
          taker(action);
        }
      }
      
      takers = takers.filter((item, index) => !(desTakes.indexOf(index) >=0));
    },
    take: (cb, matcher='*', type) => { // 装入一个action和对应的cb
      cb.matcher = matcher;
      takers.push(cb);
      cb.cancel = () => {
        remove(takers, cb);
      }
    }
  }
}

// channel 提供缓存功能，收到一个action之后，如果channel中没有指定的taker处理，则缓存该action
// 下次出现taker时直接执行
export const channel = (buffers)=>{
  let takers = [];
  let closed = false;
  buffers = buffers || [];
  return {
    put: (action) => {  // 发起一个action
      if(isEND(action)){ // 如果发起的是一个END的话，则终止所有saga
        takers.forEach(taker => {
          taker(END);
        })
        takers = [];
        return;
      }
      if(takers.length == 0){ // 如果没有指定的take匹配的话，则缓存
        return buffers.push(action);
      }
      let taker = takers.shift();
      taker(action);
    },
    take: (cb) => { // 装入一个action和对应的cb
      if(buffers.length !== 0){ // 如果缓存中有数据，则直接消耗一次buffer
        return cb(buffers.shift());
      }
      takers.push(cb);
      cb.cancel = () => {
        remove(takers, cb);
      }
    },
    flush: (cb) => { // 冲出缓存中的数据，如果channel已关闭且buffers为空，则flush操作会直接传入CHANNEL_END告诉回调channel已结束
      let item = [];
      if(closed && !buffers.length){
        cb(CHANNEL_END);
        return
      }
      while(buffers.length){
        item.push(buffers.shift());
      }
      cb(item);
    },
    close: () => { // 关闭通道
      let arr = takers;
      takers = [];
      closed = true;
      for (let i = 0, len = arr.length; i < len; i++) {
        const taker = arr[i]
        taker(CHANNEL_END)
      }
    }
  }
}

export default stdChannel;