function Task(env, mainTask, context, resolve, reject){
  this.env = env;
  this.mainTask = mainTask;
  this.context = context;
  this.resolve = resolve;
  this.reject = reject;
}

export default Task;