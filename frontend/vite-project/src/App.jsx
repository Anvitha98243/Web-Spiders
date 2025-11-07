// App.jsx - Complete with inline auth functions
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

// Inline auth helper functions
const getAuthToken = () => localStorage.getItem('token');
const setAuthToken = (token) => token && localStorage.setItem('token', token);
const removeAuthToken = () => localStorage.removeItem('token');

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

const validateAuth = () => {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) {
    removeAuthToken();
    return false;
  }
  return true;
};

// Set up axios interceptors
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!validateAuth()) {
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setAuthToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact user={user} />} />
          
          <Route 
            path="/login" 
            element={user ? <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} /> : <Login onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/register" 
            element={user ? <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} /> : <Register onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/owner-dashboard" 
            element={user && user.role === 'owner' ? <OwnerDashboard user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/tenant-dashboard" 
            element={user && user.role === 'tenant' ? <TenantDashboard user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route path="/property/:id" element={<PropertyDetails user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;