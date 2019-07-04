import { RUNNING, DONE, ABORTED } from "./taskStatus";
import remove from './utils/remove';

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

  function end(result, isErr){
    if(!isErr){
      status = DONE;
      def.resolve(result);
    } else {
      status = ABORTED;
      def.reject(result);
      // TODO 错误处理
    }

    task.cont(result, isErr); // 通知父任务：当前任务及其下面的分叉任务已完成
  }

  function cancel(){
    // TODO 取消整个执行树
  }

  const task = {
    env,
    name,
    cont, // 假如当前task有父任务，那么cont属性会被重写
    isRunning: () => status === RUNNING,
    isAborted: () => status === ABORTED,
    context: parentContext,
    end,
    queue: queue(mainTask, end),
    toPromise: ()=> def.promise
  }

  return task
}

function queue(mainTask, end){
  const queue = [];
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
        // TODO handle err
        // 取消本次任务
        // 取消其他分叉任务
        // 将错误向上传递给父task，父任务终止
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

  return {
    addTask
  }
}

export default newTask;