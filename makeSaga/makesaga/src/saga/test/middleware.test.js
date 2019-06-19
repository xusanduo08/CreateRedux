import sagaMiddleware from '../sagaMiddleware';
// import { createStore, applyMiddleware } from 'redux'

test('middleware output', () => {
    const middleware = sagaMiddleware();
    expect(typeof middleware).toBe('function');
    expect(middleware.length).toBe(1);

    const nextHandler = middleware({});
    expect(typeof nextHandler).toBe('function');
    expect(nextHandler.length).toBe(1);

    const actionHandler = nextHandler();
    expect(typeof actionHandler).toBe('function');
    expect(actionHandler.length).toBe(1);
})

test('middleware.run', () => {
    const middleware = sagaMiddleware();
    function*saga(){}
    try{
        middleware.run(saga);
    } catch(e){
        expect(e instanceof Error).toBe(true);
    }
    // createStore(()=>{}, applyMiddleware(middleware));
    // const task = middleware.run(saga);
})