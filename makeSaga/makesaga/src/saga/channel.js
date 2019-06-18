
import {TAKE, ACTION_CHANNEL} from './effectType';

const channel = (takers = []) => {  // 存储action和对应的操作

  return {
    put: (action) => {  // 发起一个action
      for (let i = 0; i < takers.length; i++) {
        let take = takers[i];
        if ((action.type === take.pattern) || take.pattern === '*') {
          let [take] = takers.splice(i, 1); // take类型操作执行一次之后要删除掉
          take.cb(action);
        }
      }
    },
    take: (cb, pattern='*', type) => { // 装入一个action和对应的cb
      takers.push({
        pattern,
        cb,
        type
      })
    }
  }
}

// actionChannel 提供缓存功能，发起一个action之后，如果actionChannel中没有指定的taker处理，则缓存action
// 下次出现taker时直接执行
export const actionChannel = ()=>{
  let takers = [];
  let buffers = []; // 缓存消息
  return {
    put: (action) => {  // 发起一个action
      if(takers.length == 0){ // 如果没有指定的take匹配的话，则缓存
        return buffers.push(action);
      }
      let take = takers.shift();
      take.cb(action);
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