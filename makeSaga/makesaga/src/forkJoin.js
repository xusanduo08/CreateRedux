import { take, actionChannel, put, call, fork, cancelled, join } from './saga/effects.js';
import deferred from './saga/utils/deferred';

let actual = []
const mainDef = deferred()
const childAdef = deferred()
const childBdef = deferred()
const defs = [deferred(), deferred(), deferred(), deferred()]
Promise.resolve()
  // .then(() => childAdef.resolve('childA resolved'))
  .then(() => defs[0].resolve('leaf 1 resolved'))
  // .then(() => childBdef.resolve('childB resolved'))
  .then(() => defs[1].resolve('leaf 2 resolved'))
  .then(() => mainDef.resolve('main error')) //
  .then(() => defs[2].resolve('leaf 3 resolved'))
  .then(() => defs[3].resolve('leaf 4 resolved'))

function* root() {
  try {
    actual.push(yield call(main))
  } catch (e) {
    actual.push('root caught ' + e)
    console.log(actual)
  }
}

function* main() {
  try {
    // yield fork(childA)
    yield fork(childB)
    actual.push(yield mainDef.promise)
    throw new Error('error')
  } finally {
    if (yield cancelled()) {  // 虽然出错了，但是这部分代码不会执行
      actual.push('main cancelled')
    }
  }
}

function* childA() {
  try {
    // yield fork(leaf, 0)
    actual.push(yield childAdef.promise)
    // yield fork(leaf, 1)
  } finally {
    if (yield cancelled()) {
      actual.push('childA cancelled')
    }
  }
}

function* childB() {
  try {
    yield fork(leaf, 2)
    yield fork(leaf, 3)
    actual.push(yield childBdef.promise)
  } finally {
    if (yield cancelled()) {
      actual.push('childB cancelled')
    }
  }
}

function* leaf(idx) {
  try {
    actual.push(yield defs[idx].promise)
  } finally {
    if (yield cancelled()) {
      actual.push(`leaf ${idx + 1} cancelled`)
    }
  }
}


const expected = [
  'childA resolved',
  'leaf 1 resolved',
  'childB resolved',
  'leaf 2 resolved',
  'main error',
  'leaf 3 cancelled',
  'leaf 4 cancelled',
  'root caught main error',
]

export default root