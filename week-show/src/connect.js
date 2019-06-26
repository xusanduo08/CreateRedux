import React, {useContext, useEffect, useReducer, useState} from 'react';
import Context from './context';

function connect(mapStateToProps){

  function reducer(state){
    let {updateCount} = state;
    return {updateCount: updateCount++}
  }

  return (Component) => {

    function ConnectComponent(){
      let {store} = useContext(Context);
      
      let [count, setCount] = useState(0);
      useEffect(() => {
        store.subscribe(() => {
          setCount(prevState => prevState + 1);
        })
      }, [])

      return (
        <Component {...mapStateToProps(store.getState())} dispatch={store.dispatch} renderCount={count} />
      )
    }

    return ConnectComponent;
  }
}

export default connect;