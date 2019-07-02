import { RUNNING, DONE, ABORTED } from "./taskStatus";

function newTask(env, parentContext, def){
  let status = RUNNING;

  return {
    env,
    isRunning: () => status === RUNNING,
    isAborted: () => status === ABORTED,
    context: parentContext,
    end: (result, isErr)=>{
      if(!isErr){
        def.resolve(result);
      }
    },
    queue: queue(),
    toPromise: ()=> def.promise
  }
}

function queue(){
  const queue = [];
  return {
    addTask: function(task){
      queue.push(task)
    }
  }
}

export default newTask;