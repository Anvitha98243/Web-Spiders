// components/Notifications.jsx - Complete with inline auth
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notifications.css';

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Inline auth helper
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    if (user && getAuthToken()) {
      fetchNotifications();
      fetchUnreadCount();
      
      const interval = setInterval(() => {
        if (getAuthToken()) {
          fetchUnreadCount();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Error fetching unread count:', error);
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await axios.put(`http://localhost:5000/api/notifications/${notification._id}/read`);
        
        setNotifications(notifications.map(n => 
          n._id === notification._id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      if (notification.link) {
        navigate(notification.link);
      }
      
      setShowDropdown(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read-all');
      
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`);
      
      setNotifications(notifications.filter(n => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interest_received': return '🔔';
      case 'interest_accepted': return '✅';
      case 'interest_rejected': return '❌';
      case 'property_update': return '🏠';
      default: return '📬';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now - notifDate;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notifDate.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="notifications-container">
      <button 
        className="notification-bell" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="mark-all-read">
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                  </div>
                  <button 
                    className="notification-delete"
                    onClick={(e) => handleDelete(notification._id, e)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button onClick={() => {
                setShowDropdown(false);
                navigate(user.role === 'owner' ? '/owner-dashboard' : '/tenant-dashboard');
              }}>
                View All
              </button>
            </div>
          )}
        </div>
      )}

      {showDropdown && (
        <div 
          className="notifications-overlay" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

export default Notifications;