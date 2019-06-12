import sagaMiddleware from '../index';

test('middleware output', () => {
    const middleware = sagaMiddleware();
    expect(typeof middleware).toBe('function');
    expect(middleware.length).toBe(0);

    const nextHandler = middleware();
    expect(typeof nextHandler).toBe('function');
    expect(nextHandler.length).toBe(1);

    const actionHandler = nextHandler();
    expect(typeof actionHandler).toBe('function');
    expect(actionHandler.length).toBe(1);
})