// pages/Home.jsx - With Location-Based Search
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const navigate = useNavigate();

  const propertyTypes = [
    { id: 'house', name: 'House', icon: '🏠' },
    { id: 'apartment', name: 'Apartment', icon: '🏢' },
    { id: 'condo', name: 'Condo', icon: '🏘️' },
    { id: 'villa', name: 'Villa', icon: '🏰' },
    { id: 'land', name: 'Land', icon: '🗺️' },
    { id: 'agriculture', name: 'Agriculture', icon: '🌾' },
    { id: 'commercial', name: 'Commercial', icon: '🏪' },
    { id: 'studio', name: 'Studio', icon: '🏠' }
  ];

  useEffect(() => {
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
        }
      );
    }
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (nearMeActive && userLocation) {
      // Navigate to tenant dashboard with near me search
      params.append('nearMe', 'true');
      params.append('userLat', userLocation.lat);
      params.append('userLon', userLocation.lon);
    } else if (searchLocation) {
      params.append('city', searchLocation);
    }
    
    if (selectedType) {
      params.append('type', selectedType);
    }
    
    navigate(`/tenant-dashboard?${params.toString()}`);
  };

  const handleNearMeClick = () => {
    if (!userLocation) {
      alert('Please enable location access to use "Near Me" feature');
      return;
    }
    setNearMeActive(!nearMeActive);
    if (!nearMeActive) {
      setSearchLocation('');
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1 className="hero-title fade-in">Find Your Dream Home</h1>
          <p className="hero-subtitle fade-in">
            Discover the perfect property from our extensive collection of luxury homes, apartments, and condos.
          </p>

          {/* Property Type Selection */}
          <div className="property-types fade-in">
            {propertyTypes.map(type => (
              <button
                key={type.id}
                className={`property-type-btn ${selectedType === type.id ? 'active' : ''}`}
                onClick={() => setSelectedType(type.id)}
              >
                <span className="property-icon">{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="search-bar fade-in">
            <button 
              className={`near-me-btn ${nearMeActive ? 'active' : ''}`}
              onClick={handleNearMeClick}
              title="Search properties near your location"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2v4M12 18v4M22 12h-4M6 12H2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {nearMeActive ? 'Near Me' : 'Near Me'}
            </button>
            
            <div className="search-input-group">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="text"
                placeholder={nearMeActive ? "Properties near you..." : "Enter location (e.g., Vadlamudi, Hyderabad)"}
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  if (e.target.value) setNearMeActive(false);
                }}
                className="search-input"
                disabled={nearMeActive}
              />
            </div>
            
            <button onClick={handleSearch} className="btn btn-primary search-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {nearMeActive ? 'Search Nearby' : 'Search Properties'}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose EstateHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Location-Based Search</h3>
              <p>Find properties near you with our smart location-based search feature</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Wide Selection</h3>
              <p>Browse through thousands of properties across multiple categories</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verified Listings</h3>
              <p>All properties are verified and posted by authentic owners</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎥</div>
              <h3>3D Tours</h3>
              <p>Experience properties with immersive 3D video tours</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Direct Contact</h3>
              <p>Connect directly with property owners without intermediaries</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast & Easy</h3>
              <p>Quick search with filters for instant results</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Find Your Perfect Property?</h2>
          <p>Join thousands of satisfied users who found their dream home through EstateHub</p>
          <div className="cta-buttons">
            <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">
              Get Started
            </button>
            <button onClick={() => navigate('/about')} className="btn btn-outline btn-lg">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;