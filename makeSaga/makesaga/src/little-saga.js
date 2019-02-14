const MATCH = 'shouldNotMATCHTAg';
const isFunc = f => typeof f === 'function';
const isIterator = fn => fn && isFunc(fn.next);

// entrance
function* root(){
    yield takeEvery('INCREMENT_ASYNC1', incrementAsync); // takeEvery最终返回的是一个对象
}

function incrementAsync(){
    value = value+1;
    document.getElementById('count').innerHTML = value;
}

proc(root());

function channel(){
    const subscribers = [];
    function take(sub, matcher){
        sub[MATCH] = matcher; // 这个matcher是一个匹配函数，如果匹配，函数返回true
        subscribers.push(sub); // 存储
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
        let result = iterator.next();// result.value就是takeEvery返回的obj，有type属性
        if(!result.done){
            runEffect(result.value, next); // result.value = {type:'fork', context: null, args:[type, fn], fn: takeEveryHelper}
        } else {
            console.log('done')
        }
    }
    function runEffect(obj, cb){ // 这地方的obj是一个task, cb是next，next方法就是上面定义的
        if(obj.type == 'fork'){
            runForkEffect(obj, cb);
        } else if(obj.type =='take'){
            runTakeEffect(obj, cb);
        }
    }

    function runForkEffect({context/**null*/, fn/*takeEveryHelper*/, args/*[type, fn]*/}, cb/**next */){
        function createTaskIterator({context, fn, args}){
            if(isIterator(fn)){
                return fn;
            }
            let result = fn.apply(context, args); // 这个result={next}
            if(isIterator(result)){
                return result;
            }
        }
        
        let result = createTaskIterator({context, fn, args});//result = {next}
        proc(result);
        cb();
    }

    function runTakeEffect({pattern}, cb){
        chan.take(cb, (input) => input == pattern);
    }
}

function takeEvery(type, fn){
    function takeEveryHepler(pattern, worker){ //入参是type, fn
        function fsmIterator(fsm, q0){
            const done = {done: true, value: undefined};
            const qEnd = {};
            let qNext=q0;
            function next(arg, error){
                let [q, output] = fsm[qNext]()
                qNext = q;
                return qNext === qEnd ? done : output;
            }
            return {next}
        }

        return fsmIterator({
            q1(){
                return ['q2', {done: false, value: {type:'take', pattern}}]; //这地方的pattern就是action
            },
            q2(){
                return ['q1', {done: false, value: {type:'fork', fn: worker}}]
            }
        }, 'q1')
    }

    return {
        type:'fork',
        context: null,
        args: [type, fn],
        fn: takeEveryHepler
    }

    
}