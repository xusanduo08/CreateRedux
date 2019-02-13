const MATCH = 'shouldNotMATCHTAg';
const isFunc = f => typeof f === 'function';
const isIterator = fn => fn && isFunc(fn.next);

// entrance
function* root(){
    yield takeEvery('INCREMENT_ASYNC1', incrementAsync);
}

function incrementAsync(){
    value = value+1;
    document.getElementById('count').innerHTML = value;
}

proc(root());

function channel(){
    const subscribers = [];
    function take(sub, matcher){
        sub[MATCH] = matcher;
        subscribers.push(sub);
    }
    function put(item){
        const arr = subscribers.slice();
        for(var i = 0, len = arr.length; i < len; i++){
            const cb = arr[i];
            if(!cb[MATCH] || cb[MATCH](item)){
                arr.splice(i, 1);
                return cb(item)
            }
        }
    }

    return {
        take, 
        put
    }
}

const chan = new channel();

function proc(iterator, args){
    next();
    function next(){
        let result = iterator.next();
        if(!result.done){
            runEffect(result.value, next);
        } else {
            console.log('done')
        }
    }
    function runEffect(obj, cb){
        if(obj.type == 'fork'){
            runForkEffect(obj, cb);
        } else if(obj.type =='take'){
            runTakeEffect(obj, cb);
        }
    }

    function runForkEffect({context, fn, args}, cb){
        function createTaskIterator({context, fn, args}){
            if(isIterator(fn)){
                return fn;
            }
            let result = fn.apply(context, args);
            if(isIterator(result)){
                return result;
            }
        }
        
        let result = createTaskIterator({context, fn, args});
        proc(result);
        cb();
    }

    function runTakeEffect({pattern}, cb){
        chan.take(cb, (input) => input == pattern);
    }
}

function takeEvery(type, fn){
    function takeEveryHepler(pattern, worker){
        function fsmIterator(fsm, q0){
            const done = {done: true, value: undefined};
            const qEnd = {};
            let qNext=q0;
            function next(arg, error){
                let [q, output] = fsm(qNext)()
                qNext = q;
                return qNext === qEnd ? done : output;
            }
            return {next}
        }
    }

    
}