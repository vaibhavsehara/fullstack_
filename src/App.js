import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import Cart from './Cart';
import SignUp from './SignUp';

const App = () => (
  <Router>
    <div>
      {/* Define routes */}
      <Routes>
        {/* Route for the login page */}
        <Route path='/login' element={<Login/>} />

        {/* Route for the dashboard page */}
        <Route path='/dashboard' element={<Dashboard/>} />

        {/* Route for the cart page */}
        <Route path='/cart' element={<Cart/>} />

        {/* Default route, redirect to login page if no matching route */}
        <Route path='/' element={<Login/>} />
          
          {/* Route for the signup page */}
          <Route path='/signup' element={<SignUp/>} />
      </Routes>
    </div>
  </Router>
);

export default App;