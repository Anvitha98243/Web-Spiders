// App.jsx - Fixed Reload Issue
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

// Protected Route Component
function ProtectedRoute({ children, user, requiredRole }) {
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} replace />;
  }

  return children;
}

// Public Route Component (redirects if already logged in)
function PublicRoute({ children, user }) {
  if (user) {
    return <Navigate to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} replace />;
  }
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication on mount
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Optional: Verify token is still valid with backend
          // Uncomment the code below to add token verification
          /*
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (!response.ok) {
            throw new Error('Token invalid');
          }
          */
          
          setUser(parsedUser);
        } catch (error) {
          console.error('Error verifying authentication:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    verifyAuth();
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
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact user={user} />} />
          
          {/* Auth Routes - Redirect if already logged in */}
          <Route 
            path="/login" 
            element={
              <PublicRoute user={user}>
                <Login onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute user={user}>
                <Register onLogin={handleLogin} />
              </PublicRoute>
            } 
          />
          
          {/* Protected Routes */}
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
              <ProtectedRoute user={user}>
                <PropertyDetails user={user} />
              </ProtectedRoute>
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