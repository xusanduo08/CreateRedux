function is(x, y){
  if(x === y){
    return x !== 0 || y !== 0 || 1/x === 1/y;
  } else {
    return x != x || y != y;
  }
}

function shallowEqual(objA, objB){
  if(is(objA, objB)){
    return true;
  }

  if(typeof objA != 'object' || typeof objB != 'object' 
    || objA === null || objB === null){
      return false;
    }

  let keysA = Object.keys(objA);
  keysA.forEach(key => {
    if(!is(objA[key], objB[key])){
      return false
    }
  })
  return true;
}

export default shallowEqual;