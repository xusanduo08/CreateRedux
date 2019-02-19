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

