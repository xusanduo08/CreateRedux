const is = {
  func: (fn) => {
    return typeof fn == 'function';
  },
  iterator: (fn) => {
    return is.func(fn.next);
  },
  promise: p => {
    return p && is.func(p.then);
  },
  channel: ch => {
    return is.func(ch.take) && is.func(ch.put);
  },
  pattern: pat => {
    return typeof pat === 'string'
  }
}

export default is;