
const channel = (takers = []) => {  // 存储action和对应的操作

  return {
    put: (action) => {  // 发起一个action
      for (let i = 0; i < takers.length; i++) {
        let take = takers[i];
        if (action.type === take.action && take.type === 'TAKE') {
          
          take.cb(action);
          takers.splice(i, 1); // take类型操作执行一次之后要删除掉
        }
      }
    },
    take: (action, cb, type) => { // 装入一个action和对应的cb
      takers.push({
        action,
        cb,
        type
      })
    }
  }
}

export default channel;