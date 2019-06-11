import is from '../utils/is';

const resolvePromise= (promise, cb) => {
  promise.then(cb, error => {
    console.log(error);
  })
}

// 自动执行iterator
function runIterator(iterator, arg){
  if(is.iterator(iterator)){
    let result;
    if(arg){
      result = iterator.next(arg);
    } else {
      result = iterator.next();
    }
    
    if(!result.done){
      if(is.promise(result.value)){
        resolvePromise(result.value, arg => runIterator(iterator, arg));
      }
    }
  }
}


export default runIterator;