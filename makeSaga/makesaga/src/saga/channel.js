
const is = {
  func: (fn) =>{
    return typeof fn == 'function';
  },
  iterator: (fn) =>{
    return is.func(fn.next);
  },
  promise: p => {
    return p && is.func(p.then);
  }
}

const resolvePromise= (promise, cb) => {
  promise.then(cb, error => {
    console.log(error);
  })
}

const channel = (takers = []) => {  // 存储action和对应的操作

  return {
    put: (action) => {  // 发起一个action
      for (let i = 0; i < takers.length; i++) {
        let take = takers[i];
        if (take.action == action) {
          let result = take.cb();

          if (is.iterator(result)){
            
            let {done, value} = result.next();
            if(!done){
              if(is.promise(value)){
                resolvePromise(value, arg => result.next(arg));
              }
            }
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