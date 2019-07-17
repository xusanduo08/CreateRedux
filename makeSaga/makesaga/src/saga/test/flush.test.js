import { createStore, applyMiddleware } from 'redux'
import { channel, CHANNEL_END } from '../channel';
import sagaMiddleware from '../sagaMiddleware';
import * as io from '../effects'
test('saga flush handling', () => {
  let actual = []
  const middleware = sagaMiddleware()
  createStore(() => ({}), {}, applyMiddleware(middleware))

  function* genFn() {
    const chan = yield io.call(channel)
    actual.push(yield io.flush(chan))
    yield io.put(chan, 1)
    yield io.put(chan, 2)
    yield io.put(chan, 3)
    actual.push(yield io.flush(chan))
    yield io.put(chan, 4)
    yield io.put(chan, 5)
    chan.close()
    actual.push(yield io.flush(chan))
    actual.push(yield io.flush(chan))
  }

  const task = middleware.run(genFn)
  const expected = [[], [1, 2, 3], [4, 5], CHANNEL_END]
  return task.toPromise().then(() => {
    // saga must handle generator flushes
    expect(actual).toEqual(expected)
  })
})
