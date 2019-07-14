import { RUNNING, DONE, ABORTED, CANCELLED } from "./taskStatus";
import remove from './utils/remove';
const noop = () =>{}
/**
 * 
 * @param {环境信息} env 
 * @param {*} parentContext 
 * @param {promise} def 
 * @param {当前task的名称，取值一般为对应saga方法的名称} name 
 * @param {当前task对应的mainTask} mainTask 
 * @param {当前task完成后需要执行的方法，会被放到task的cont属性上，如果该task是个分叉任务，那么cont属性会被父task重写} cont 
 */
function newTask(env, parentContext, def, name, mainTask, cont){
  let status = RUNNING;
  let queue = forkQueue(mainTask, end);
  let taskResult;
  function end(result, isErr){
    if(!isErr){
      if(result === 'cancel_task'){
        status = CANCELLED;
      } else if(status !== CANCELLED) { // TODO 为什么
        status = DONE;
      }
      taskResult = result;
      def.resolve(result);
    } else {
      status = ABORTED;
      def.reject(result);
      // TODO 错误处理
    }
    task.joiners.forEach(joiner => { // 执行当前正在等待该任务的回调
      joiner.cb(result);
    })
    task.joiners = null;
    task.cont(result, isErr); // 通知父任务：当前任务及其下面的分叉任务已完成
  }

  function cancel(){
    if(status === RUNNING){
      status = CANCELLED;
      queue.cancelAll(); // 取消以当前task为根的执行树
      end('cancel_task', false); // 终止自己
    }
  }

  const task = {
    env,
    name,
    cont, // 假如当前task有父任务，那么cont属性会被重写
    isRunning: () => status === RUNNING,
    isAborted: () => status === ABORTED,
    isCancelled: () => status === CANCELLED || (status === RUNNING && mainTask.status === CANCELLED),
    context: parentContext,
    end,
    joiners: [], // 放置当前正在等待该任务的回调，任务结束后会执行这些回调
    queue,
    cancel,
    result: () => taskResult,
    toPromise: ()=> def.promise
  }

  return task
}

function forkQueue(mainTask, end){
  let queue = []; // 如果使用const声明的话会提示'queue is read-only'
  let completed = false;
  let result;
  addTask(mainTask);

  function addTask(task){ // task：一个分叉任务，将这个分叉任务添加到父级任务中
    queue.push(task);
    task.cont = (res, isErr) => {
      if(completed){
        return;
      }
      remove(queue, task); // 从父级任务中移除分叉任务
      if(isErr){
        // 取消本次任务
        // task.cancel(res, isErr)
       
        // 取消其他分叉任务
        cancelAll();
        // 将错误向上传递给父task，父任务终止
        end(res, isErr)
      } else {
        if(task === mainTask){
          result = res;
        }
        if(!queue.length){ // 如果分叉任务完成且父任务也完成了，进行主task的end操作,结束主task
          completed = true;
          end(result, false);
        }
      }
    }
  }

  // 取消本次任务下所有分叉任务
  function cancelAll(){
    if(completed){
      return;
    }
    completed = true;
    queue.forEach(task => {
      task.cont = noop;
      task.cancel();
    })
    queue = [];
  }

  return {
    addTask,
    cancelAll
  }
}

export default newTask;