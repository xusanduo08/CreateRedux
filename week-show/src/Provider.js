import React from 'react';
import Context from './context';
import Subscription from './Subscription';

class Provider extends React.Component{
  constructor(props){
    super(props);
    const {store} = this.props;
    const parentSub = new Subscription(store, null);
    parentSub.onStateChange = parentSub.notifyNestListeners.bind(parentSub);
    this.state = {
      parentSub
    }
  }

  componentDidMount(){
    this.state.parentSub.trySubscribe();
  }
  componentWillUnmount(){
    this.state.parentSub.unSubscribe();
  }

  render(){
    const { store } = this.props;
    const { parentSub } = this.state;
    return (
      <Context.Provider value={{store, parentSub}}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

export default Provider;