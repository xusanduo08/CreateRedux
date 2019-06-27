
function is(x, y){
  if(x === y){ // 例外： +0 === -0 -> true
    return x !== 0 || y !== 0 || 1/x !== 1/y;
  } else { // 例外： NaN !== NaN -> true
    return x !== x || y !== y;
  }
}

function shallowEqual(objA, objB){
  if(is(objA, objB)){
    return true;
  }

  if(typeof objA !== 'object' || typeof objB !== 'object'
    || objA === null || objB === null){
    return false;
  }

  let keys = Object.keys(objA);
  let result = false;
  result = !keys.some(key => {
    if(!objB.hasOwnProperty(key) || !is(objA[key], objB[key])){
      return true;
    }
  })
  return result;
}

export default shallowEqual;