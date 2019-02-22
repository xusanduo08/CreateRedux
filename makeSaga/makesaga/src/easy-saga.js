function next(arg, isErr){
    let result;
    if(isErr){
        result = iterator.throw(arg);
    } else {
        result = iterator.next(arg);
    }
    const {done, value} = result;

    if(done){
        return;
    }

    if(value[0] === 'promise'){
        const promise = value[1];
        promise.then(resolvedValue => next(resolvedValue), error  => next(error, true));
    } else if(value[0] === 'delay'){
        const timeout = value[1];
        setTimeout(() => next(`${timeout}ms elapsed`), timeout);
    } else if(value[0] === 'ping'){
        next('pong')
    } else {
        iterator.throw(new Error('无法识别的effect'));
    }
}

const TASK_CANCEL =   Symbol('TASK_CANCEL');
const CANCEL = Symbol('CANCEL');

function proc(iterator, parentContext, cont){
    // 先构造task为如下结构 
    const task = {
        cancel: () => next(TASK_CANCEL)
    }

    cont.cancel = task.cancel;
    next();
    return task;

    function next(arg, isErr){
        try{
            let result;
            if(isErr){
                result = iterator.throw(arg);
            } else if(arg === TASK_CANCEL) {
                next.cancel();
                result = iterator.return(TASK_CANCEL)
            } else {
                result = iterator.next(arg);
            }

            if(!result.done){
                digestEffect(result.value, next)
            } else {
                cont(result.value);// 迭代器执行完毕，调用cont将结果返回上层
            }
        } catch(error){
            cont(error, true)
        }
    }

    function digestEffect(rawEffect, cb){
        ///...
        runEffect();
        ///...

    }

    function runEffect(effect, currCb){
        const effectType = effect[0];
        if(effectType === 'promise'){
            resolvePromise(effect, ctx, currCb);
        } else if(effectType === 'iterator'){
            resolveIterator(iterator, ctx, currCb)
        } else {
            throw new Error('Unknown effect type');
        }
    }

    function resolvePromise([effectType, promise], ctx, cb){
        const cancelPromise = promise[CANCEL];
        if(is.func(cancelPromise)){
            cb.cancel = cancelPromise;
        }
        promise.then(cb, error => cb(error, true));
    }

    function resolveIterator([effectType, iterator], ctx, cb){
        proc(iterator, ctx, cb)
    }
}