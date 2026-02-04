import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SurveyForm from './components/SurveyForm';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

import logo from './assets/logo.svg';

import AdminPanel from './components/AdminPanel';

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logo} alt="Logo" className="nav-logo" style={{ height: '40px', width: '40px' }} />
            Digital Census Lite
          </div>
          <div>
            {authToken && (
              <button
                onClick={logout}
                className="logout-btn"
              >
                Logout
              </button>
            )}
          </div>
        </nav>

        <Routes>
          <Route
            path="/login"
            element={authToken ? <Navigate to="/" /> : <Login setAuthToken={setAuthToken} />}
          />
          <Route
            path="/register"
            element={authToken ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/"
            element={authToken ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/survey"
            element={authToken ? <SurveyForm /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={authToken ? <AdminPanel /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
