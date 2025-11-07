// pages/PropertyDetails.jsx - Updated without Call/Email buttons
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PropertyDetails.css';

function PropertyDetails({ user }) {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [interestMessage, setInterestMessage] = useState('');
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [expressing, setExpressing] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperty();
    if (user && user.role === 'tenant') {
      checkExistingInterest();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/properties/${id}`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingInterest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/interests/my-interests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const hasInterest = response.data.some(
        interest => interest.propertyId._id === id && interest.status === 'pending'
      );
      setHasExpressedInterest(hasInterest);
    } catch (error) {
      console.error('Error checking interest:', error);
    }
  };

  const handleExpressInterest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      alert('Only tenants can express interest in properties');
      return;
    }

    setExpressing(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/interests',
        {
          propertyId: id,
          message: interestMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHasExpressedInterest(true);
      setShowInterestModal(false);
      setInterestMessage('');
      alert('Interest expressed successfully! The owner will be notified and will contact you directly.');
    } catch (error) {
      console.error('Error expressing interest:', error);
      alert(error.response?.data?.message || 'Failed to express interest');
    } finally {
      setExpressing(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const nextImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading property details...</div>;
  }

  if (!property) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Property not found</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  const canExpressInterest = user && user.role === 'tenant' && property.status === 'available';
  const isOwner = user && property.ownerId === user.id;

  return (
    <div className="property-details">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>

        <div className="details-grid">
          {/* Image Gallery */}
          <div className="image-section">
            {property.images && property.images.length > 0 ? (
              <>
                <div className="main-image">
                  <img 
                    src={property.images[currentImageIndex]} 
                    alt={property.title}
                  />
                  {property.images.length > 1 && (
                    <>
                      <button className="image-nav prev" onClick={prevImage}>‹</button>
                      <button className="image-nav next" onClick={nextImage}>›</button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </div>
                <div className="thumbnail-grid">
                  {property.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${property.title} ${idx + 1}`}
                      className={idx === currentImageIndex ? 'active' : ''}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-image-large">No Images Available</div>
            )}

            {/* 3D Video */}
            {property.video3D && (
              <div className="video-section">
                <h3>🎥 3D Property Tour</h3>
                <video controls className="property-video">
                  <source src={property.video3D} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>

          {/* Property Information */}
          <div className="info-section">
            <div className="property-header">
              <div>
                <span className={`badge ${property.listingType}`}>
                  {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                <h1 className="property-title">{property.title}</h1>
                <p className="property-location">
                  📍 {property.address}, {property.city}, {property.state} - {property.zipCode}
                </p>
              </div>
              <div className="property-price-large">{formatPrice(property.price)}</div>
            </div>

            {/* Interest Button for Tenants */}
            {canExpressInterest && !isOwner && (
              <div className="interest-section">
                {hasExpressedInterest ? (
                  <div className="interest-expressed">
                    <span className="interest-badge">✓ Interest Expressed</span>
                    <p>You have already expressed interest in this property. The owner will contact you soon using the details you provided during registration.</p>
                  </div>
                ) : (
                  <button 
                    className="btn btn-primary btn-block btn-interest"
                    onClick={() => setShowInterestModal(true)}
                  >
                    ❤️ {property.listingType === 'rent' ? 'I Want to Rent' : 'I Want to Buy'}
                  </button>
                )}
              </div>
            )}

            <div className="property-features">
              <div className="feature-item">
                <span className="feature-icon">🏠</span>
                <div>
                  <p className="feature-label">Type</p>
                  <p className="feature-value">{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</p>
                </div>
              </div>
              {property.bedrooms && (
                <div className="feature-item">
                  <span className="feature-icon">🛏️</span>
                  <div>
                    <p className="feature-label">Bedrooms</p>
                    <p className="feature-value">{property.bedrooms}</p>
                  </div>
                </div>
              )}
              {property.bathrooms && (
                <div className="feature-item">
                  <span className="feature-icon">🚿</span>
                  <div>
                    <p className="feature-label">Bathrooms</p>
                    <p className="feature-value">{property.bathrooms}</p>
                  </div>
                </div>
              )}
              <div className="feature-item">
                <span className="feature-icon">📏</span>
                <div>
                  <p className="feature-label">Area</p>
                  <p className="feature-value">{property.area} {property.areaUnit}</p>
                </div>
              </div>
            </div>

            <div className="description-section">
              <h2>Description</h2>
              <p>{property.description}</p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="amenities-section">
                <h2>Amenities</h2>
                <div className="amenities-list">
                  {property.amenities.map((amenity, idx) => (
                    <span key={idx} className="amenity-tag">✓ {amenity}</span>
                  ))}
                </div>
              </div>
            )}

            {!isOwner && (
              <div className="owner-section">
                <h2>Owner Information</h2>
                <div className="owner-info">
                  <div className="owner-details">
                    <p><strong>Name:</strong> {property.ownerName}</p>
                    <p><strong>Email:</strong> {property.ownerEmail}</p>
                    <p><strong>Phone:</strong> {property.ownerPhone}</p>
                  </div>
                  <div className="owner-note">
                    <p style={{ 
                      backgroundColor: '#e3f2fd', 
                      padding: '16px', 
                      borderRadius: '8px',
                      color: '#1565c0',
                      marginTop: '15px',
                      lineHeight: '1.6'
                    }}>
                      💡 <strong>Tip:</strong> Express your interest using the button above, and the owner will contact you directly using your registered contact information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interest Modal */}
      {showInterestModal && (
        <div className="modal-overlay" onClick={() => setShowInterestModal(false)}>
          <div className="modal-content interest-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Express Interest</h2>
              <button className="close-btn" onClick={() => setShowInterestModal(false)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <p>You are expressing interest in <strong>{property.title}</strong></p>
              <p>The property owner will be notified and will contact you directly using your registered email and phone number.</p>
              
              <div className="form-group">
                <label className="form-label">Message to Owner (Optional)</label>
                <textarea
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  className="form-textarea"
                  placeholder="Add a message to the owner... (e.g., preferred viewing time, questions about the property)"
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setShowInterestModal(false)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleExpressInterest} 
                className="btn btn-primary"
                disabled={expressing}
              >
                {expressing ? 'Sending...' : 'Confirm Interest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyDetails;