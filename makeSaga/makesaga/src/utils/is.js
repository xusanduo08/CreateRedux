const is = {
  func: (fn) => {
    return typeof fn == 'function';
  },
  iterator: (fn) => {
    return is.func(fn.next);
  },
  promise: p => {
    return p && is.func(p.then);
  }
}

export default is;