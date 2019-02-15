// 点击按钮时能读到action的值

function channel(){
    let taker;
    
    function take(cb){
        taker = cb;
    }

    function put(input){
        if(taker){
            const tempTaker = taker;
            taker = null;
            tempTaker(input);
        }
    }

    return {
        put, 
        take
    }
}

const chan = channel();

function take(){
    return {
        type:'take'
    }
}

function* mainSaga(){
    const action = yield take();
    console.log(action);
}

function runTakeEffect(effect, cb){
    chan.take(input => {
        cb(input);
    });
}

function task(iterator){
    const iter = iterator();
    function next(args){
        const result = iter.next(args);
        if(!result.done){
            const effect = result.value;
            if(effect.type === 'take'){
                runTakeEffect(result.value, next);
            }
        }
    }

    next();
}

task(mainSaga);

let i = 0;


function sagaEvent(btn){
    document.getElementById(btn).addEventListener('click', ()=> {
        const action = `action data${i++}`;
        chan.put(action);
    }, false);
}

export default sagaEvent