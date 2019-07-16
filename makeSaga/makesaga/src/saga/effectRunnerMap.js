import { channel } from './channel';
import { TAKE, ACTION_CHANNEL } from './effectType';
import matcher from './matcher';
import { isEND } from './utils/isEND';
import * as is from './utils/is';
import proc from './proc';
import remove from './utils/remove';

// effectRunnerMap统一catch错误，出现错误后调用cb(err, true)，交给下一次next执行
const noop = ()=>{};
function runTakeEffect(env, { channel = env.channel, pattern }, cb, {parentTask}) {
  try{
    channel.take(cb, matcher(pattern), TAKE);
  } catch(e){
    cb(e, true);
  }
}

// 发送了一个action后，如果channel中没有接收的taker，则将这次消息缓存
/**
 * actionChannel会检测当前takers中有没有接收当前消息的takes，没有的话则缓存，等待指定的taker
 */
function runChannelEffect(env, { pattern }, cb) {
  const chan = channel();

  const currCb = (action) => {
    if (!isEND(action)) {
      env.channel.take(currCb, matcher(pattern), ACTION_CHANNEL); // 需要一直监听对应的action
    }

    chan.put(action);
  };
  try {
    env.channel.take(currCb, matcher(pattern), ACTION_CHANNEL); // stdChannel负责根据action触发对应的操作
    cb(chan);
  } catch (e) {
    cb(e, true);
  }

}

// 发起一个action或者向指定的channel存入一个pattern
function runPutEffect(env, { channel, action }, cb) {
  try {
    /**
     * channel.put返回的可能是个promise
     * dispatch返回的就是入参
     */
    let result = channel ? channel.put(action) : env.dispatch(action);
    if(is.promise(result)){ // result 可能是个promise
      result.then(cb, error => {
        cb(error, true);
      })
    } else {
      cb(result);
    }
  } catch (e) {
    cb(e, true);
  }
}

// 调用一个方法，可以是普通方法，也可以是返回promise的方法，或者是generator
function runCallEffect(env, {context, fn, args }, cb) {
  try {
    const result = fn.apply(context, args);
    if(is.iterator(result)){
      return proc(env, {}, result, false, cb, fn.name);
    } else if(is.promise(result)){
      result.then(cb, error => {
        cb(error, true);
      })
      return
    }
    cb(result);
  } catch (e) {
    cb(e, true)
  }
}

/**
 * 
 * @param {*} env 
 * @param {*} param1 detach是否时分离任务，true是，false否
 * @param {*} cb 当前任务执行完毕后需要执行的回调
 * @param {*} parentTask 父级任务 
 */
function runForkEffect(env, {context, fn, args, detached}, cb, {parentTask}){
  try{
    const result = fn.apply(context, args);
    let iterator = null;
    let resolve = false;
    if(is.promise(result)){ // promise要二次包装，这么做是为了触发task的end方法，以便将promise的结果返回出去
      iterator = {
        next:(arg)=>{
          if(!resolve){
            resolve = true;
            return {value:result, done: false}
          } else {
            return {value:arg, done: true}
          }
        }
      }
    } else if(!is.iterator(result)){
      iterator = {
        next:()=>{
          return {value:result, done: true}
        }
      }
    } else {
      iterator = result;
    }
    /**
     * 对于fork产生的task来讲，结束时只要通知父task它结束了就可以了，即调用自身的task.cont方法
     */
    const child = proc(env, parentTask.context, iterator, false, noop, fn.name)
    if(detached){
      cb(child);
    } else {
      if(child.isRunning()){
        parentTask.queue.addTask(child);
        
        cb(child)
      } else if(child.isAborted()){ // 如果分支任务出错的话，取消主任务下的所有分支任务
        // TODO 取消其他分支任务
      } else {
        cb(child);
      }
    }
  } catch(e){
    cb(e, true)
  }
}

function runCancelledEffect(env, {}, cb, {parentTask}){
  cb(parentTask.isCancelled());
}

function runJoinEffect(env, {taskOrTasks}, cb, {parentTask}){ // 等待指定任务完成再继续往下执行
  // 等待task结束再执行cb
  if(is.array(taskOrTasks)){

    let generateCb = (taskOrTasks, parentCb) => { // 将parentCb分解，当所有joiners执行完毕时再执行parentCb
      let totalCount = taskOrTasks.length;
      let exCount = 0;
      let completed = false;
      let resultArray = new Array(totalCount);
      let currCb = (index) => {
        return (result, isErr) => {
          if(completed){
            return
          }
          if(!isErr){
            exCount++;
            resultArray[index] = result;
            if(exCount === totalCount){
              completed = true;
              parentCb(resultArray);
            }
          } else {
            parentCb(result, isErr);
          }
        }
      }
      return taskOrTasks.map((task, index) => {
        return currCb(index);
      })
    }
    let childCb = generateCb(taskOrTasks,cb);
    taskOrTasks.forEach((task, index) => {
      if(task.isRunning()){
        task.joiners.push({cb: childCb[index]});
      } else {
        childCb[index](task.result())
      }
      
    })

  } else {
    if(taskOrTasks.isRunning()){
      taskOrTasks.joiners.push({cb});
      cb.cancel = () => {
        remove(taskOrTasks.joiners, cb);
      }
    } else {
      cb(taskOrTasks.result())
    }
    
  }
  
}

function runCancelEffect(env, {taskOrTasks}, cb){
  try{
    if(is.array(taskOrTasks)){
      taskOrTasks.map(task => task.cancel())
      cb();
    } else {
      taskOrTasks.cancel();
      cb();
    }
  }catch(e){
    cb(e, true)
  }
}

export default {
  TAKE: runTakeEffect,
  ACTION_CHANNEL: runChannelEffect,
  PUT: runPutEffect,
  CALL: runCallEffect,
  FORK: runForkEffect,
  CANCELLED: runCancelledEffect,
  JOIN: runJoinEffect,
  CANCEL: runCancelEffect
}