// pages/TenantDashboard.jsx - With Wishlist and Location-Based Search
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './TenantDashboard.css';

function TenantDashboard({ user }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: '',
    listingType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    nearMe: false,
    radius: 10
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const propertyTypes = [
    { value: '', label: 'All Types' },
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'villa', label: 'Villa' },
    { value: 'land', label: 'Land' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'studio', label: 'Studio' }
  ];

  const radiusOptions = [
    { value: 3, label: '3 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 15, label: '15 km' },
    { value: 20, label: '20 km' },
    { value: 50, label: '50 km' }
  ];

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem(`wishlist_${user.id}`);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Location-based search disabled.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }

    // Apply URL parameters
    const cityParam = searchParams.get('city');
    const typeParam = searchParams.get('type');
    
    if (cityParam || typeParam) {
      setFilters(prev => ({
        ...prev,
        city: cityParam || '',
        propertyType: typeParam || ''
      }));
    }
  }, [searchParams, user.id]);

  useEffect(() => {
    fetchProperties();
  }, [filters, userLocation]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.propertyType) params.append('propertyType', filters.propertyType);
      if (filters.listingType) params.append('listingType', filters.listingType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      
      // Location-based search
      if (filters.nearMe && userLocation) {
        params.append('nearMe', 'true');
        params.append('userLat', userLocation.lat);
        params.append('userLon', userLocation.lon);
        params.append('radius', filters.radius);
      } else if (filters.city) {
        params.append('city', filters.city);
      }

      const response = await axios.get(`http://localhost:5000/api/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({ 
      ...filters, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleNearMeToggle = () => {
    if (!userLocation && !filters.nearMe) {
      alert('Please enable location access to use "Near Me" feature');
      return;
    }
    setFilters({ ...filters, nearMe: !filters.nearMe, city: '' });
  };

  const resetFilters = () => {
    setFilters({
      propertyType: '',
      listingType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      nearMe: false,
      radius: 10
    });
    setShowWishlistOnly(false);
  };

  const toggleWishlist = (propertyId, e) => {
    e.stopPropagation(); // Prevent navigation when clicking heart
    
    let updatedWishlist;
    if (wishlist.includes(propertyId)) {
      updatedWishlist = wishlist.filter(id => id !== propertyId);
    } else {
      updatedWishlist = [...wishlist, propertyId];
    }
    
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(updatedWishlist));
  };

  const isInWishlist = (propertyId) => {
    return wishlist.includes(propertyId);
  };

  const getDisplayedProperties = () => {
    if (showWishlistOnly) {
      return properties.filter(property => wishlist.includes(property._id));
    }
    return properties;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading && properties.length === 0) {
    return <div className="loading">Loading properties...</div>;
  }

  const displayedProperties = getDisplayedProperties();

  return (
    <div className="tenant-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div>
              <h1>Welcome, {user.name}!</h1>
              <p>Browse available properties and find your dream home</p>
            </div>
            <button 
              className={`btn ${showWishlistOnly ? 'btn-primary' : 'btn-outline'} wishlist-toggle-btn`}
              onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            >
              ❤️ Wishlist ({wishlist.length})
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content container">
        {/* Filters Section */}
        <div className="filters-section">
          <h2>Filter Properties</h2>
          
          {/* Location Search */}
          <div className="location-search">
            <button 
              className={`btn ${filters.nearMe ? 'btn-primary' : 'btn-outline'}`}
              onClick={handleNearMeToggle}
              disabled={!userLocation && !filters.nearMe}
            >
              📍 {filters.nearMe ? 'Near Me Active' : 'Search Near Me'}
            </button>
            
            {filters.nearMe && (
              <div className="radius-selector">
                <label className="form-label">Search Radius:</label>
                <select
                  name="radius"
                  value={filters.radius}
                  onChange={handleFilterChange}
                  className="form-select"
                >
                  {radiusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} Near Me
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {locationError && (
              <p className="location-error">{locationError}</p>
            )}
          </div>

          <div className="filters-grid">
            <div className="form-group">
              <label className="form-label">Property Type</label>
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleFilterChange}
                className="form-select"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Listing Type</label>
              <select
                name="listingType"
                value={filters.listingType}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">All</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">City / Location</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Enter city name (e.g., Vadlamudi)"
                disabled={filters.nearMe}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Min Price (₹)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Min price"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Price (₹)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="form-input"
                placeholder="Max price"
              />
            </div>

            <div className="form-group">
              <button onClick={resetFilters} className="btn btn-secondary" style={{ marginTop: '26px' }}>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="properties-section">
          <h2>
            {showWishlistOnly 
              ? `My Wishlist (${displayedProperties.length})`
              : filters.nearMe 
                ? `Properties within ${filters.radius} km (${displayedProperties.length})` 
                : filters.city 
                  ? `Properties in ${filters.city} (${displayedProperties.length})` 
                  : `All Properties (${displayedProperties.length})`
            }
          </h2>
          
          {displayedProperties.length === 0 ? (
            <div className="no-properties">
              <p>
                {showWishlistOnly 
                  ? 'No properties in your wishlist yet. Start adding some!'
                  : filters.nearMe 
                    ? `No properties found within ${filters.radius} km of your location`
                    : 'No properties found matching your criteria'
                }
              </p>
            </div>
          ) : (
            <div className="properties-grid">
              {displayedProperties.map(property => (
                <div key={property._id} className="property-card" onClick={() => navigate(`/property/${property._id}`)}>
                  <div className="property-image">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <span className={`property-badge ${property.listingType}`}>
                      {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    {property.distance && (
                      <span className="distance-badge">
                        📍 {property.distance} km from you
                      </span>
                    )}
                    <button 
                      className={`wishlist-heart ${isInWishlist(property._id) ? 'active' : ''}`}
                      onClick={(e) => toggleWishlist(property._id, e)}
                      title={isInWishlist(property._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {isInWishlist(property._id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  
                  <div className="property-content">
                    <h3 className="property-title">{property.title}</h3>
                    <p className="property-location">
                      📍 {property.address}, {property.city}
                    </p>
                    <p className="property-type">
                      🏠 {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                    </p>
                    
                    <div className="property-details">
                      {property.bedrooms && (
                        <span>🛏 {property.bedrooms} Beds</span>
                      )}
                      {property.bathrooms && (
                        <span>🚿 {property.bathrooms} Baths</span>
                      )}
                      <span>📏 {property.area} {property.areaUnit}</span>
                    </div>
                    
                    <div className="property-footer">
                      <div className="property-price">{formatPrice(property.price)}</div>
                      <button className="btn btn-primary btn-sm">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;
