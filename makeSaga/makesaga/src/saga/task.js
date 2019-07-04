import { RUNNING, DONE, ABORTED } from "./taskStatus";
import remove from './utils/remove';

function newTask(env, parentContext, def, name){
  let status = RUNNING;

  return {
    env,
    name,
    isRunning: () => status === RUNNING,
    isAborted: () => status === ABORTED,
    context: parentContext,
    end: (result, isErr)=>{
      if(!isErr){
        def.resolve(result);
        // TODO 需要等待所有分叉任务完成后才能关闭当前任务
        if(/**TODO 如果当前任务完成且所有分叉任务也完成的话 */){
          // TODO需要继续执行，并且执行在父task中的cont方法。告诉父task，本分叉任务完成了
        } else {
          // TODO 分叉任务没有完成
        }
      } else {
        status = ABORTED;
      }
    },
    queue: queue(),
    toPromise: ()=> def.promise
  }
}

function queue(){
  const queue = [];
  let completed = false;
  let parentTask;
  return {
    addTask: function(task){ // task：一个分叉任务，将这个分叉任务添加到父级任务中
      queue.push(task);
      task.cont = (res, isErr) => {
        if(completed){
          return;
        }
        remove(queue, task); // 从父级任务中移出分叉任务
        if(isErr){
          // TODO handle err
        } else {
          if(!queue.length){ // TODO 如果分叉任务完成且父任务也完成了，进行下一步
            completed = true;
          }
        }
      }
    },
    isEmpty: () => queue.length === 0
  }
}

export default newTask;