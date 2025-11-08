// App.jsx - Fixed to Stay on Same Route After Reload
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
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user has wrong role, redirect to their correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} replace />;
  }

  // Otherwise, render the children
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading">
        <div>Loading...</div>
      </div>
    );
  }

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