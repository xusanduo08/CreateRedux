
export const END = {type:'CHANNEL_END_TYPE'} // 发起这个action表示终止所有saga
export const isEND = (action={}) => action && action.type === END.type;