// pages/OwnerDashboard.jsx - COMPLETE FIXED VERSION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './OwnerDashboard.css';

function OwnerDashboard({ user }) {
  const [properties, setProperties] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'house',
    listingType: 'rent',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    bedrooms: '',
    bathrooms: '',
    area: '',
    areaUnit: 'sqft',
    floors: '',
    yearBuilt: '',
    parking: '',
    furnishing: 'unfurnished',
    amenities: []
  });
  const [images, setImages] = useState([]);
  const [video3D, setVideo3D] = useState(null);
  const navigate = useNavigate();

  const propertyTypeConfig = {
    house: {
      label: 'House',
      fields: ['bedrooms', 'bathrooms', 'floors', 'parking', 'yearBuilt', 'furnishing'],
      amenities: ['Parking', 'Garden', 'Balcony', 'Security', 'Power Backup', 'Wi-Fi'],
      areaUnits: ['sqft', 'sqm']
    },
    apartment: {
      label: 'Apartment',
      fields: ['bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing'],
      amenities: ['Parking', 'Swimming Pool', 'Gym', 'Elevator', 'Security', 'Power Backup', 'Wi-Fi', 'AC'],
      areaUnits: ['sqft', 'sqm']
    },
    condo: {
      label: 'Condo',
      fields: ['bedrooms', 'bathrooms', 'floors', 'parking', 'furnishing'],
      amenities: ['Parking', 'Swimming Pool', 'Gym', 'Elevator', 'Security', 'Power Backup', 'Wi-Fi', 'AC'],
      areaUnits: ['sqft', 'sqm']
    },
    villa: {
      label: 'Villa',
      fields: ['bedrooms', 'bathrooms', 'floors', 'parking', 'yearBuilt', 'furnishing'],
      amenities: ['Parking', 'Swimming Pool', 'Garden', 'Balcony', 'Security', 'Power Backup', 'Wi-Fi', 'AC'],
      areaUnits: ['sqft', 'sqm']
    },
    studio: {
      label: 'Studio',
      fields: ['bathrooms', 'floors', 'parking', 'furnishing'],
      amenities: ['Parking', 'Elevator', 'Security', 'Power Backup', 'Wi-Fi', 'AC'],
      areaUnits: ['sqft', 'sqm']
    },
    land: {
      label: 'Land',
      fields: [],
      amenities: ['Road Access', 'Water Supply', 'Electricity', 'Fencing'],
      areaUnits: ['sqft', 'sqm', 'acres']
    },
    agriculture: {
      label: 'Agriculture Land',
      fields: [],
      amenities: ['Water Source', 'Irrigation', 'Electricity', 'Road Access', 'Fencing', 'Shed'],
      areaUnits: ['acres', 'sqft', 'sqm']
    },
    commercial: {
      label: 'Commercial',
      fields: ['floors', 'parking', 'yearBuilt'],
      amenities: ['Parking', 'Elevator', 'Security', 'Power Backup', 'Wi-Fi', 'AC', 'Conference Room', 'Cafeteria'],
      areaUnits: ['sqft', 'sqm']
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchInterests();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }

      console.log('Fetching properties with token:', token.substring(0, 20) + '...');
      const response = await axios.get(API_ENDPOINTS.PROPERTIES.MY_PROPERTIES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Properties fetched:', response.data);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInterests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.INTERESTS.RECEIVED, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterests(response.data);
    } catch (error) {
      console.error('Error fetching interests:', error);
    }
  };

  const handleInterestStatusUpdate = async (interestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        API_ENDPOINTS.INTERESTS.BY_ID(interestId),
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchInterests();
      alert(`Interest ${status} successfully!`);
    } catch (error) {
      console.error('Error updating interest:', error);
      alert('Failed to update interest status');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'propertyType') {
      const config = propertyTypeConfig[value];
      const newFormData = { ...formData, propertyType: value, amenities: [] };
      
      if (!config.fields.includes('bedrooms')) newFormData.bedrooms = '';
      if (!config.fields.includes('bathrooms')) newFormData.bathrooms = '';
      if (!config.fields.includes('floors')) newFormData.floors = '';
      if (!config.fields.includes('parking')) newFormData.parking = '';
      if (!config.fields.includes('yearBuilt')) newFormData.yearBuilt = '';
      if (!config.fields.includes('furnishing')) newFormData.furnishing = 'unfurnished';
      
      if (value === 'land' || value === 'agriculture') {
        newFormData.areaUnit = 'acres';
      } else {
        newFormData.areaUnit = 'sqft';
      }
      
      setFormData(newFormData);
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Images selected:', files.length);
    setImages(files);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    console.log('Video selected:', file?.name);
    setVideo3D(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form Data:', formData);
    console.log('Images:', images.length);
    console.log('Video:', video3D?.name);

    try {
      // Validate token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Create FormData
      const data = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== '' && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      // Add images
      if (images.length > 0) {
        images.forEach((image, index) => {
          console.log(`Adding image ${index + 1}:`, image.name);
          data.append('images', image);
        });
      }

      // Add video
      if (video3D) {
        console.log('Adding video:', video3D.name);
        data.append('video3D', video3D);
      }

      // Log FormData contents
      console.log('FormData contents:');
      for (let pair of data.entries()) {
        console.log(pair[0], ':', pair[1]);
      }

      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log('Upload progress:', percentCompleted + '%');
        }
      };

      let response;
      if (editingProperty) {
        console.log('Updating property:', editingProperty._id);
        response = await axios.put(
          API_ENDPOINTS.PROPERTIES.BY_ID(editingProperty._id),
          data,
          config
        );
        console.log('Property updated successfully:', response.data);
        alert('Property updated successfully!');
      } else {
        console.log('Creating new property...');
        response = await axios.post(
          API_ENDPOINTS.PROPERTIES.BASE,
          data,
          config
        );
        console.log('Property created successfully:', response.data);
        alert('Property added successfully!');
      }

      await fetchProperties();
      closeModal();
    } catch (error) {
      console.error('=== ERROR SUBMITTING PROPERTY ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Error saving property. ';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
      console.log('=== FORM SUBMISSION ENDED ===');
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      propertyType: property.propertyType,
      listingType: property.listingType,
      price: property.price,
      address: property.address,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
      country: property.country,
      bedrooms: property.bedrooms || '',
      bathrooms: property.bathrooms || '',
      area: property.area,
      areaUnit: property.areaUnit,
      floors: property.floors || '',
      yearBuilt: property.yearBuilt || '',
      parking: property.parking || '',
      furnishing: property.furnishing || 'unfurnished',
      amenities: property.amenities || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.PROPERTIES.BY_ID(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Property deleted successfully!');
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error deleting property. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProperty(null);
    setError('');
    setFormData({
      title: '',
      description: '',
      propertyType: 'house',
      listingType: 'rent',
      price: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      bedrooms: '',
      bathrooms: '',
      area: '',
      areaUnit: 'sqft',
      floors: '',
      yearBuilt: '',
      parking: '',
      furnishing: 'unfurnished',
      amenities: []
    });
    setImages([]);
    setVideo3D(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredInterests = filterStatus === 'all' 
    ? interests 
    : interests.filter(i => i.status === filterStatus);

  const pendingInterests = interests.filter(i => i.status === 'pending').length;
  const acceptedInterests = interests.filter(i => i.status === 'accepted').length;

  const currentConfig = propertyTypeConfig[formData.propertyType];
  const showField = (fieldName) => currentConfig.fields.includes(fieldName);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <h1>Welcome, {user.name}!</h1>
          <p>Manage your property listings and inquiries</p>
        </div>
      </div>

      <div className="dashboard-content container">
        {error && (
          <div className="error-message" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            🏠 My Properties
            <span className="tab-count">{properties.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'interests' ? 'active' : ''}`}
            onClick={() => setActiveTab('interests')}
          >
            📋 Interest Requests
            <span className="tab-count">{interests.length}</span>
            {pendingInterests > 0 && (
              <span className="tab-badge">{pendingInterests}</span>
            )}
          </button>
        </div>

        {activeTab === 'properties' ? (
          <>
            <div className="dashboard-actions">
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                + Add New Property
              </button>
            </div>

            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-icon">🏠</div>
                <div className="stat-info">
                  <h3>{properties.length}</h3>
                  <p>Total Properties</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{properties.filter(p => p.status === 'available').length}</h3>
                  <p>Available</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔑</div>
                <div className="stat-info">
                  <h3>{properties.filter(p => p.status === 'rented').length}</h3>
                  <p>Rented</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>{properties.filter(p => p.status === 'sold').length}</h3>
                  <p>Sold</p>
                </div>
              </div>
            </div>

            <h2 className="section-title">My Properties</h2>
            {properties.length === 0 ? (
              <div className="no-properties">
                <p>You haven't listed any properties yet.</p>
                <button onClick={() => setShowModal(true)} className="btn btn-primary">
                  List Your First Property
                </button>
              </div>
            ) : (
              <div className="properties-grid">
                {properties.map(property => (
                  <div key={property._id} className="property-card">
                    <div className="property-image">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                        />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                      <span className={`status-badge ${property.status}`}>
                        {property.status}
                      </span>
                    </div>
                    
                    <div className="property-content">
                      <h3 className="property-title">{property.title}</h3>
                      <p className="property-location">📍 {property.city}, {property.state}</p>
                      <p className="property-type">
                        🏠 {property.propertyType} • {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                      </p>
                      <div className="property-price">{formatPrice(property.price)}</div>
                      
                      <div className="property-actions">
                        <button onClick={() => navigate(`/property/${property._id}`)} className="btn btn-outline btn-sm">
                          View
                        </button>
                        <button onClick={() => handleEdit(property)} className="btn btn-secondary btn-sm">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(property._id)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="interests-filters">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({interests.length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({pendingInterests})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilterStatus('accepted')}
              >
                Accepted ({acceptedInterests})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilterStatus('rejected')}
              >
                Rejected ({interests.filter(i => i.status === 'rejected').length})
              </button>
            </div>

            {filteredInterests.length === 0 ? (
              <div className="no-interests">
                <p>No {filterStatus !== 'all' ? filterStatus : ''} interest requests found.</p>
              </div>
            ) : (
              <div className="interests-list">
                {filteredInterests.map(interest => (
                  <div key={interest._id} className="interest-card">
                    <div className="interest-header">
                      <div>
                        <h3>{interest.propertyTitle}</h3>
                        <p className="interest-date">📅 {formatDate(interest.createdAt)}</p>
                      </div>
                      <span className={`interest-status ${interest.status}`}>
                        {interest.status}
                      </span>
                    </div>

                    <div className="interest-tenant-info">
                      <h4>Tenant Details:</h4>
                      <p><strong>Name:</strong> {interest.tenantName}</p>
                      <p><strong>Email:</strong> {interest.tenantEmail}</p>
                      <p><strong>Phone:</strong> {interest.tenantPhone}</p>
                      {interest.message && (
                        <p className="interest-message">
                          <strong>Message:</strong> {interest.message}
                        </p>
                      )}
                    </div>

                    {interest.status === 'pending' && (
                      <div className="interest-actions">
                        <button 
                          onClick={() => handleInterestStatusUpdate(interest._id, 'accepted')}
                          className="btn btn-success btn-sm"
                        >
                          ✓ Accept
                        </button>
                        <button 
                          onClick={() => handleInterestStatusUpdate(interest._id, 'rejected')}
                          className="btn btn-danger btn-sm"
                        >
                          ✗ Reject
                        </button>
                        <a href={`tel:${interest.tenantPhone}`} className="btn btn-secondary btn-sm">
                          📞 Call
                        </a>
                        <a href={`mailto:${interest.tenantEmail}`} className="btn btn-outline btn-sm">
                          ✉️ Email
                        </a>
                      </div>
                    )}

                    {interest.status === 'accepted' && (
                      <div className="interest-contact-actions">
                        <a href={`tel:${interest.tenantPhone}`} className="btn btn-primary btn-sm">
                          📞 Call Tenant
                        </a>
                        <a href={`mailto:${interest.tenantEmail}`} className="btn btn-secondary btn-sm">
                          ✉️ Email Tenant
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Property Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            {error && (
              <div className="error-message" style={{ margin: '20px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="property-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Property Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Spacious 3BHK Villa in Jubilee Hills"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe your property in detail..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    {Object.entries(propertyTypeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Listing Type *</label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="rent">For Rent</option>
                    <option value="sale">For Sale</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter price"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="City name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="State name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ZIP Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ZIP code"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Fields */}
              <div className="form-row">
                {showField('bedrooms') && (
                  <div className="form-group">
                    <label className="form-label">Bedrooms *</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Number of bedrooms"
                      required
                    />
                  </div>
                )}

                {showField('bathrooms') && (
                  <div className="form-group">
                    <label className="form-label">Bathrooms *</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Number of bathrooms"
                      required
                    />
                  </div>
                )}

                {showField('floors') && (
                  <div className="form-group">
                    <label className="form-label">Total Floors</label>
                    <input
                      type="number"
                      name="floors"
                      value={formData.floors}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Number of floors"
                    />
                  </div>
                )}

                {showField('parking') && (
                  <div className="form-group">
                    <label className="form-label">Parking Spaces</label>
                    <input
                      type="number"
                      name="parking"
                      value={formData.parking}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Parking spaces"
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Area *</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Total area"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    name="areaUnit"
                    value={formData.areaUnit}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {currentConfig.areaUnits.map(unit => (
                      <option key={unit} value={unit}>
                        {unit === 'sqft' ? 'Square Feet' : unit === 'sqm' ? 'Square Meters' : 'Acres'}
                      </option>
                    ))}
                  </select>
                </div>

                {showField('yearBuilt') && (
                  <div className="form-group">
                    <label className="form-label">Year Built</label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Year built"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                )}

                {showField('furnishing') && (
                  <div className="form-group">
                    <label className="form-label">Furnishing Status</label>
                    <select
                      name="furnishing"
                      value={formData.furnishing}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="fully-furnished">Fully Furnished</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Amenities / Features</label>
                <div className="amenities-grid">
                  {currentConfig.amenities.map(amenity => (
                    <label key={amenity} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Property Images (Max 10)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="form-input"
                />
                {images.length > 0 && (
                  <p style={{ marginTop: '8px', color: '#666' }}>
                    {images.length} image(s) selected
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">3D Tour Video (Optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="form-input"
                />
                {video3D && (
                  <p style={{ marginTop: '8px', color: '#666' }}>
                    Video selected: {video3D.name}
                  </p>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting 
                    ? (editingProperty ? 'Updating...' : 'Adding...') 
                    : (editingProperty ? 'Update Property' : 'Add Property')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;