import {isEND, END} from './utils/isEND';

const channel = (takers = []) => {  // 主channel，存储action和对应的操作
  return {
    put: (action) => {  // 发起一个action
      if(isEND(action)){ // 如果发起的是一个END的话，则终止所有saga
        takers.forEach(taker => {
          taker.cb(END);
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
          taker.cb(action);
        }
      }
      
      takers = takers.filter((item, index) => !(desTakes.indexOf(index) >=0));
    },
    take: (cb, matcher='*', type) => { // 装入一个action和对应的cb
      takers.push({
        matcher,
        cb,
        type
      })
    }
  }
}

// actionChannel 提供缓存功能，收到一个action之后，如果actionChannel中没有指定的taker处理，则缓存该action
// 下次出现taker时直接执行
export const actionChannel = ()=>{
  let takers = [];
  let buffers = []; // 缓存消息
  return {
    put: (action) => {  // 发起一个action
      if(isEND(action)){ // 如果发起的是一个END的话，则终止所有saga
        takers.forEach(taker => {
          taker.cb(END);
        })
        takers = [];
        return;
      }
      if(takers.length == 0){ // 如果没有指定的take匹配的话，则缓存
        return buffers.push(action);
      }
      let taker = takers.shift();
      taker.cb(action);
    },
    take: (cb) => { // 装入一个action和对应的cb
      if(buffers.length !== 0){ // 如果缓存中有数据，则直接消耗一次buffer
        return cb(buffers.shift());
      }
      takers.push({
        cb
      })
    }
  }
}

export default channel;