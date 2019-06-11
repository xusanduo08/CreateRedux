import is from '../utils/is';
import runIterator from './runIterator';


const channel = (takers = []) => {  // 存储action和对应的操作

  return {
    put: (action) => {  // 发起一个action
      for (let i = 0; i < takers.length; i++) {
        let take = takers[i];
        if (take.action == action) {
          let result = take.cb();

          if (is.iterator(result)){
            
            runIterator(result);
          } else {
            return result;
          }
        }
      }
    },
    take: (action, cb) => { // 装入一个action和对应的cb
      takers.push({
        action,
        cb
      })
    }
  }
}

export default channel;