// pages/About.jsx
import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About EstateHub</h1>
          <p>Your trusted partner in finding the perfect property</p>
        </div>
      </div>

      <div className="about-content container">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            EstateHub was founded with a simple mission: to make property search and rental easier, 
            faster, and more transparent. We understand that finding the right home or investment 
            property can be overwhelming, which is why we've created a platform that brings property 
            owners and seekers together seamlessly.
          </p>
          <p>
            Our platform leverages modern technology to provide immersive property experiences, 
            including 3D virtual tours, detailed property information, and direct communication 
            channels between owners and potential tenants or buyers.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon">🔍</div>
              <h3>Wide Selection</h3>
              <p>
                Browse through thousands of properties including houses, apartments, villas, 
                commercial spaces, and agricultural land across multiple locations.
              </p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">✅</div>
              <h3>Verified Listings</h3>
              <p>
                All properties are posted by verified owners, ensuring authenticity and 
                eliminating middlemen from the process.
              </p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">🎥</div>
              <h3>3D Virtual Tours</h3>
              <p>
                Experience properties from the comfort of your home with immersive 3D video 
                tours that give you a real feel of the space.
              </p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">💬</div>
              <h3>Direct Communication</h3>
              <p>
                Connect directly with property owners without any intermediaries, making the 
                entire process transparent and efficient.
              </p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">🎯</div>
              <h3>Advanced Filters</h3>
              <p>
                Use our powerful filtering system to narrow down properties based on type, 
                location, price range, and amenities.
              </p>
            </div>
            <div className="feature-box">
              <div className="feature-icon">📱</div>
              <h3>Easy to Use</h3>
              <p>
                Our intuitive interface makes it easy for both property owners and seekers 
                to navigate and use all features effortlessly.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>For Property Owners</h2>
          <p>
            If you're a property owner looking to rent or sell, EstateHub provides you with:
          </p>
          <ul className="benefits-list">
            <li>Easy property listing with comprehensive details</li>
            <li>Upload multiple high-quality images</li>
            <li>Add 3D video tours to showcase your property</li>
            <li>Manage all your listings from one dashboard</li>
            <li>Edit or remove listings anytime</li>
            <li>Direct contact with potential tenants or buyers</li>
            <li>Reach thousands of property seekers</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>For Property Seekers</h2>
          <p>
            If you're looking for a property, EstateHub offers:
          </p>
          <ul className="benefits-list">
            <li>Extensive property listings across various categories</li>
            <li>Detailed property information with images and videos</li>
            <li>Advanced search and filtering options</li>
            <li>Direct contact information for property owners</li>
            <li>Save and compare properties</li>
            <li>View properties in your preferred location</li>
            <li>No hidden fees or commissions</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Our Commitment</h2>
          <p>
            At EstateHub, we're committed to providing a secure, transparent, and user-friendly 
            platform for all your real estate needs. We continuously work on improving our services 
            and adding new features to enhance your experience.
          </p>
          <p>
            Whether you're a first-time home buyer, an experienced investor, a property owner, 
            or someone looking for a rental, EstateHub is here to make your property journey 
            smooth and successful.
          </p>
        </section>

        <section className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied users today</p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary btn-lg">Create Account</a>
            <a href="/contact" className="btn btn-outline btn-lg">Contact Us</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;