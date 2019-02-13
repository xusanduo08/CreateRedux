import { nextTick } from "q";

const TASK_CANCEL = Symbol('TASK_CANCEL');
const CANCEL = Symbol('CANCEL');

function proc(iterator, parentContext, cont){
  const task = {
    cancel: () => next(TASK_CANCEL)
  }

  cont.cancel = task.cancel;
  next();

  return task

  function next(arg, isErr){
    try{
      let result;
      if(isErr){
        result = iterator.throw(arg);
      } else if(arg === TASK_CANCEL){
        next.cancel();
        result = iterator.return(TASK_CANCEL)
      } else {
        result = iterator.next(arg)
      }

      if(!result.done){
        digestEffect(result.value, next);
      } else {
        cont(result.value);
      }
    } catch(error){
      cont(error, true)
    }
  }

  function runEffect(effect, currCb){
    const effectType = effect[0];
    if(effectType === 'promise'){
      resolvePromise(effect, ctx, currCb);
    } else if(effectType === 'iterator'){
      resolveIterator(iterator, ctx, currCb);
    } else {
      throw new Error('Unknown effect type');
    }
  }

  function resolvePromise([effectType, promise], ctx, cb){
    const cancelPromise = promise[CANCEL];
    if(is.func(cancelPromise)){
      cb.cancel = cancelPromise;
    }
    promise.then(cb, error=> cb(error, true));
  }

  function resolveIterator([effectType, iterator], ctx, cb){
    proc(iterator, ctx, cb);
  }
}