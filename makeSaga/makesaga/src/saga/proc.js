
// 专门处理iterator
function proc(iterator, channel) {
  while(true){
    let {done, value} = iterator.next();
    if(!done){
      // TODO
      // 如果generator没有结束的话，那么需要做两件事
      // 1.处理当前value中包含的操作
      // 2.继续向下执行generator
      channel.take(value.actionType, value.fn);
    } else {
      break;
    }
  }
  
  
}

export default proc;