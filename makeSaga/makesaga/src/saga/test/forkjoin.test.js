import { call, fork, take, join, cancelled, cancel } from '../effects';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from '../sagaMiddleware';
import deferred from '../utils/deferred';
import * as is from '../utils/is'

test('saga fork handling: generators', () => {
  let sagaMiddleware = createSagaMiddleware();
  createStore(()=>{}, {}, applyMiddleware(sagaMiddleware));
  
  let task, task1

  function* subGen(arg){
    yield Promise.resolve(1);
    return arg
  }

  class C{
    constructor(val){
      this.val = val;
    }
    *gen(){
      return this.val
    }
  }

  const inst = new C(2);

  function* getFn(){
    task = yield fork(subGen, 1);
    task1 = yield fork([inst, inst.gen])
  }
  const mainTask = sagaMiddleware.run(getFn);
  mainTask.toPromise()
    .then(() => {
      expect(task.name).toBe('subGen');
      expect(is.promise(task.toPromise())).toBe(true);
      return Promise.all([task.toPromise(), task1.toPromise()])
    }).then(actual => {
      expect(actual).toEqual([1, 2])
    })
})

test('saga join handling : generators', () => {
  let sagaMiddleware = createSagaMiddleware();
  const store = createStore(()=>{}, {}, applyMiddleware(sagaMiddleware));
  let actual = [];

  let defs = [deferred(), deferred()];

  function* subGen(arg){
    yield defs[1].promise;
    return arg;
  }

  function * getFn(){
    let task = yield fork(subGen, 1);
    actual.push(yield defs[0].promise);
    actual.push(yield take('action 1'));
    actual.push(yield join(task));
  }

  sagaMiddleware.run(getFn);
  Promise.resolve(1)
    .then(() => {
      defs[0].resolve(true)
    })
    .then(() => {
      store.dispatch({type:'action 1'})
    })
    .then(() => {
      defs[1].resolve(2)
    })
    .then(() => {
      expect(actual).toEqual([true, {type:'action 1'}, 1])
    })
})

test('saga fork/join handling : functions', () => {
  let actual = []
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))
  const defs = [deferred(), deferred()]
  Promise.resolve(1)
    .then(() => defs[0].resolve(true))
    .then(() => defs[1].resolve(2))

  function api() {
    return defs[1].promise
  }

  function syncFn() {
    return 'sync'
  }

  function* genFn() {
    const task = yield fork(api) // fork(fn) 返回的task，可以理解为proc(..., fn, ...)产生的task
    const syncTask = yield fork(syncFn)
    actual.push(yield defs[0].promise)
    actual.push(yield join(task))
    actual.push(yield join(syncTask))
  }

  const task = middleware.run(genFn)
  const expected = [true, 2, 'sync']
  return task.toPromise().then(() => {
    // saga must not block on forked tasks, but block on joined tasks
    expect(actual).toEqual(expected)
  })
})

test('saga fork wait for attached children', () => {
  const actual = []
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))
  const rootDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = [deferred(), deferred(), deferred(), deferred()]
  Promise.resolve()
    .then(childAdef.resolve)
    .then(rootDef.resolve)
    .then(defs[0].resolve)
    .then(childBdef.resolve)
    .then(defs[2].resolve)
    .then(defs[3].resolve)
    .then(defs[1].resolve)

  function* root() {
    yield fork(childA)
    yield rootDef.promise
    yield fork(childB)
  }

  function* childA() {
    yield fork(leaf, 0)
    yield childAdef.promise
    yield fork(leaf, 1)
  }

  function* childB() {
    yield fork(leaf, 2)
    yield childBdef.promise
    yield fork(leaf, 3)
  }

  function* leaf(idx) {
    yield defs[idx].promise
    actual.push(idx)
  }

  const task = middleware.run(root)
  return task.toPromise().then(() => {
    // parent task must wait for all forked tasks before terminating
    expect(actual).toEqual([0, 2, 3, 1])
  })
})

test('saga auto cancel forks on error', () => {
  const actual = []
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = [deferred(), deferred(), deferred(), deferred()]
  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => mainDef.reject('main error')) //
    .then(() => defs[2].resolve('leaf 3 resolved'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      actual.push(yield call(main))
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield fork(childA)
      yield fork(childB)
      actual.push(yield mainDef.promise)
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield cancelled()) {
        actual.push('main cancelled')
      }
    }
  }

  function* childA() {
    try {
      yield fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield fork(leaf, 1)
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

  const task = middleware.run(root)
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
  return task.toPromise().then(() => {
    // parent task must cancel all forked tasks when it aborts
    expect(actual).toEqual(expected)
  })
})

test('saga auto cancel forks on main cancelled', () => {
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))
  const actual = []
  const rootDef = deferred()
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = [deferred(), deferred(), deferred(), deferred()]
  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => rootDef.resolve('root resolved'))
    .then(() => mainDef.resolve('main resolved'))
    .then(() => defs[2].resolve('leaf 3 resolved'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      const task = yield fork(main)
      actual.push(yield rootDef.promise)
      yield cancel(task)
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield fork(childA)
      yield fork(childB)
      actual.push(yield mainDef.promise)
    } finally {
      if (yield cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield fork(leaf, 1)
    } finally {
      if (yield cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield fork(leaf, 2)
      yield fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } finally {
      if (yield cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const task = middleware.run(root)
  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'root resolved',
    'main cancelled',
    'leaf 3 cancelled',
    'leaf 4 cancelled',
  ]
  return task.toPromise().then(() => {
    // parent task must cancel all forked tasks when it's cancelled
    expect(actual).toEqual(expected)
  })
})

test('saga auto cancel forks if a child aborts', () => {
  const actual = []
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = [deferred(), deferred(), deferred(), deferred()]
  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => mainDef.resolve('main resolved'))
    .then(() => defs[2].reject('leaf 3 error'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      actual.push(yield call(main))
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield fork(childA)
      yield fork(childB)
      actual.push(yield mainDef.promise)
      return 'main returned'
    } finally {
      if (yield cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield fork(leaf, 1)
    } finally {
      if (yield cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield fork(leaf, 2)
      yield fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const task = middleware.run(root)
  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'main resolved',
    'leaf 3 error',
    'leaf 4 cancelled',
    'root caught leaf 3 error',
  ]
  return task.toPromise().then(() => {
    // parent task must cancel all forked tasks when it aborts
    expect(actual).toEqual(expected)
  })
})

test('saga auto cancel parent + forks if a child aborts', () => {
  const actual = []
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))
  const mainDef = deferred()
  const childAdef = deferred()
  const childBdef = deferred()
  const defs = [deferred(), deferred(), deferred(), deferred()]
  Promise.resolve()
    .then(() => childAdef.resolve('childA resolved'))
    .then(() => defs[0].resolve('leaf 1 resolved'))
    .then(() => childBdef.resolve('childB resolved'))
    .then(() => defs[1].resolve('leaf 2 resolved'))
    .then(() => defs[2].reject('leaf 3 error'))
    .then(() => mainDef.resolve('main resolved'))
    .then(() => defs[3].resolve('leaf 4 resolved'))

  function* root() {
    try {
      actual.push(yield call(main))
    } catch (e) {
      actual.push('root caught ' + e)
    }
  }

  function* main() {
    try {
      yield fork(childA)
      yield fork(childB)
      actual.push(yield mainDef.promise)
      return 'main returned'
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield cancelled()) actual.push('main cancelled')
    }
  }

  function* childA() {
    try {
      yield fork(leaf, 0)
      actual.push(yield childAdef.promise)
      yield fork(leaf, 1)
    } finally {
      if (yield cancelled()) actual.push('childA cancelled')
    }
  }

  function* childB() {
    try {
      yield fork(leaf, 2)
      yield fork(leaf, 3)
      actual.push(yield childBdef.promise)
    } finally {
      if (yield cancelled()) actual.push('childB cancelled')
    }
  }

  function* leaf(idx) {
    try {
      actual.push(yield defs[idx].promise)
    } catch (e) {
      actual.push(e)
      throw e
    } finally {
      if (yield cancelled()) actual.push(`leaf ${idx + 1} cancelled`)
    }
  }

  const task = middleware.run(root)
  const expected = [
    'childA resolved',
    'leaf 1 resolved',
    'childB resolved',
    'leaf 2 resolved',
    'leaf 3 error',
    'leaf 4 cancelled',
    'main cancelled',
    'root caught leaf 3 error',
  ]
  return task.toPromise().then(() => {
    // parent task must cancel all forked tasks when it aborts
    expect(actual).toEqual(expected)
  })
})

test('joining multiple tasks', () => {
  const defs = [deferred(), deferred(), deferred()]
  let actual
  const middleware = createSagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))

  function* worker(i) {
    return yield defs[i].promise
  }

  function* genFn() {
    const task1 = yield fork(worker, 0)
    const task2 = yield fork(worker, 1)
    const task3 = yield fork(worker, 2)
    actual = yield join([task1, task2, task3])
  }

  const mainTask = middleware.run(genFn)
  Promise.resolve()
    .then(() => defs[0].resolve(1))
    .then(() => defs[2].resolve(3))
    .then(() => defs[1].resolve(2))
  const expected = [1, 2, 3]
  return mainTask.toPromise().then(() => {
    // it must be possible to join on multiple tasks
    expect(actual).toEqual(expected)
  })
})