// App.jsx - Fixed to Stay on Same Route After Reload (WITH DEBUGGING)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TenantDashboard from './pages/TenantDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import PropertyDetails from './pages/PropertyDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

// Protected Route Component - Only redirects if not authenticated
function ProtectedRoute({ children, user, requiredRole }) {
  console.log('ProtectedRoute - User:', user, 'Required Role:', requiredRole);
  
  // If no user, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If user has wrong role, redirect to their correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    console.log('Wrong role, redirecting to correct dashboard');
    return <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} replace />;
  }

  // Otherwise, render the children
  console.log('User authenticated, rendering protected route');
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounting - checking authentication...');
    
    // Check for existing authentication on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('No token or user data found');
    }
    
    setLoading(false);
    console.log('Authentication check complete');
  }, []);

  const handleLogin = (userData, token) => {
    console.log('Login successful:', userData);
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    console.log('Logging out...');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Show loading state while checking authentication
  if (loading) {
    console.log('Showing loading state...');
    return (
      <div className="loading">
        <div>Loading...</div>
      </div>
    );
  }

  console.log('Rendering App with user:', user);

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          {/* Public Routes - Always accessible */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact user={user} />} />
          
          {/* Auth Routes - Accessible even if logged in */}
          <Route 
            path="/login" 
            element={<Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={<Register onLogin={handleLogin} />} 
          />
          
          {/* Protected Routes - Require authentication */}
          <Route 
            path="/tenant-dashboard" 
            element={
              <ProtectedRoute user={user} requiredRole="tenant">
                <TenantDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner-dashboard" 
            element={
              <ProtectedRoute user={user} requiredRole="owner">
                <OwnerDashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/property/:id" 
            element={
              <PropertyDetails user={user} />
            } 
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;