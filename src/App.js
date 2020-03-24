import React, { Component } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import history from './history';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import BikeList from './components/bikes/BikeList';
import BikeMap from './components/bikes/BikeMap';
import Homepage from './components/homepage';
import './App.css';
import SearchBike from './components/bikes/searchBike';



class App extends Component {

  render() {
    
    return (
      <Provider store={store}>
        <Router history={history}>
          <Switch>
          <Route exact path='/' component={Homepage} />
          <Route exact path='/BikeList' component={BikeList} />
          <Route exact path='/BikeMap' component={BikeMap} />
          <Route exact path='/searchBike' component={SearchBike} />
          </Switch>
        </Router>
      </Provider>
    );
  }
}


export default App;
