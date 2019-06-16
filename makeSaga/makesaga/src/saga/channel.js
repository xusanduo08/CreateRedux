
import {TAKE} from './effectType';

const channel = (takers = []) => {  // 存储action和对应的操作

  return {
    put: (action) => {  // 发起一个action
      for (let i = 0; i < takers.length; i++) {
        let take = takers[i];
        if ((action.type === take.pattern && take.type === TAKE) || take.pattern === '*') {
          let [take] = takers.splice(i, 1); // take类型操作执行一次之后要删除掉
          take.cb(action);
        }
      }
    },
    take: (pattern='*', cb, type) => { // 装入一个action和对应的cb
      takers.push({
        pattern,
        cb,
        type
      })
    }
  }
}

export default channel;