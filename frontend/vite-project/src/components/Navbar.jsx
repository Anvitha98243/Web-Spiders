// components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>EstateHub</span>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          
          {user ? (
            <>
              <Link 
                to={user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard'} 
                className="navbar-link"
              >
                Dashboard
              </Link>
              <Link to="/about" className="navbar-link">About</Link>
              <Link to="/contact" className="navbar-link">Contact</Link>
              
              <div className="navbar-user">
                <Notifications user={user} />
                <span className="user-name">{user.name}</span>
                <span className="user-badge">{user.role}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/about" className="navbar-link">About</Link>
              <Link to="/contact" className="navbar-link">Contact</Link>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;