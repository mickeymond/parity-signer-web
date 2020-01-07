import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'rc-dialog/assets/bootstrap.css';
import './App.css';

import { BrowserRouter, Route } from 'react-router-dom';

import Home from './screens/Home';
import Login from './screens/Login';

class App extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <Route path="/" exact component={Home} />
        <Route path="/login" exact component={Login} />
      </BrowserRouter>
    );
  }
}

export default App;
