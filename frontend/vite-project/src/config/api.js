// Create this file: frontend/vite-project/src/config/api.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    ME: `${API_URL}/api/auth/me`,
  },
  PROPERTIES: {
    BASE: `${API_URL}/api/properties`,
    MY_PROPERTIES: `${API_URL}/api/properties/owner/my-properties`,
    BY_ID: (id) => `${API_URL}/api/properties/${id}`,
  },
  INTERESTS: {
    BASE: `${API_URL}/api/interests`,
    RECEIVED: `${API_URL}/api/interests/received`,
    MY_INTERESTS: `${API_URL}/api/interests/my-interests`,
    BY_ID: (id) => `${API_URL}/api/interests/${id}`,
  },
  NOTIFICATIONS: {
    BASE: `${API_URL}/api/notifications`,
    UNREAD_COUNT: `${API_URL}/api/notifications/unread-count`,
    READ_ALL: `${API_URL}/api/notifications/read-all`,
    BY_ID: (id) => `${API_URL}/api/notifications/${id}`,
  }
};

export default API_URL;