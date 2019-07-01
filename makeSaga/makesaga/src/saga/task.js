function Task(env, mainTask, context, resolve, reject){
  this.env = env;
  this.mainTask = mainTask;
  this.context = context;
}

export default Task;