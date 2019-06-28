
// 协助组件完成订阅操作，确保每次更新都是父组件先于子组件更新
// 为啥要确保父组件在子组件之前更新？
// 子组件的渲染可能会取父组件的一些数据，父组件在子组件之前更新能确保子组件更新时子组件接收到的参数都是最新的
function Subscription (store, parentSub){
  this.subscribe = null;
  this.unSubscribe = null;
  this.nestListeners = [];

  this.trySubscribe = function(){
    if(!this.subscribe){
      this.unSubscribe = parentSub ? parentSub.addNestSub(this.onStateChange) : store.subscribe(this.onStateChange);
    }
  }

  this.addNestSub = function(listeners){
    this.nestListeners.push(listeners);
    // TODO return unSubscribe
  }
  this.notifyNestListeners = function(){
    this.nestListeners.forEach(fn => fn());
  }
}

export default Subscription;