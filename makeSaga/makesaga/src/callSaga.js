import * as io from './saga/effects.js';

let actual = []
  class C {
    constructor(val) {
      this.val = val
    }

    method() {
      return Promise.resolve(this.val)
    }
  }

  const inst1 = new C(1)
  const inst2 = new C(2)
  const inst3 = new C(3)
  const inst4 = new C(4)
  const inst5 = new C(5)
  const inst6 = new C(6)

  const eight = Symbol(8)

  function* subGen(io, arg) {
    yield Promise.resolve(null)
    return arg
  }

  function identity(arg) {
    return arg
  }

  function* genFn() {
    actual.push(yield io.call([inst1, inst1.method]))
    actual.push(yield io.call([inst2, 'method']))
    actual.push(yield io.apply(inst3, inst3.method))
    actual.push(yield io.apply(inst4, 'method'))
    actual.push(yield io.call({ context: inst5, fn: inst5.method }))
    actual.push(yield io.call({ context: inst6, fn: 'method' }))
    actual.push(yield io.call(subGen, io, 7))
    actual.push(yield io.call(identity, eight))
    console.log(actual);
  }

export default genFn;