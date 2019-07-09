import { fork, cancelled } from './saga/effects.js';
import deferred from './saga/utils/deferred';


const actual = [];

let cancelDef = deferred();
const rootDef = deferred();
const childAdef = deferred();
const childBdef = deferred();
const neverDef = deferred();
const defs = [deferred(), deferred(), deferred(), deferred()];

Promise.resolve(1)
  .then(() => childAdef.resolve('childA resolve'))
  .then(() => rootDef.resolve('root resolve'))
  .then(() => defs[0].resolve('leaf 0 resolve'))
  .then(() => childBdef.resolve('childB resolve')) //
  .then(() => cancelDef.resolve('cancel'))
  .then(() => defs[3].resolve('leaf 3 resolve'))
  .then(() => defs[2].resolve('leaf 2 resolve'))
  .then(() => defs[1].resolve('leaf 1 resolve'))

function* main() {
  try {
    yield fork(childA);
    actual.push(yield rootDef.promise);
    console.log(actual)
    yield fork(childB);
    yield neverDef.promise;
  } finally {
    if (yield cancelled) {
      actual.push('main cancelled');
    }
  }
}

function* childA() {
  try {
    yield fork(leaf, 0);
    actual.push(yield childAdef.promise);
    yield fork(leaf, 1)
    yield neverDef.promise;
  } finally {
    if (yield cancelled()) {
      actual.push('childA cancelled');
    }
  }
}

function* childB() {
  try {
    yield fork(leaf, 2);
    actual.push(yield childBdef.promise);
    yield fork(leaf, 3);
    yield neverDef.promise
  } finally {
    if (cancelled()) {
      actual.push('childB cancelled');
    }
  }
}

function* leaf(idx) {
  try {
    actual.push(yield defs[idx].promise)
  } finally {
    if (yield cancelled()) {
      actual.push(`leaf ${idx} cancelled`);
    }
  }
}


const expected = [
  'childA resolve',
  'root resolve',
  'leaf 0 resolve',
  'childB resolve',
  /* cancel */
  'main cancelled',
  'childA cancelled',
  'leaf 1 cancelled',
  'childB cancelled',
  'leaf 2 cancelled',
  'leaf 3 cancelled',
]
export default main;