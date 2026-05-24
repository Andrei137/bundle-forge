import { useState } from 'react';
import './Footer.css';

const PaymentIcon = ({ name }) => (
  <div className="payment-icon" title={name}>{name}</div>
);

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">

      {/* Back to Top */}
      <button className="back-to-top" onClick={scrollToTop}>
        BACK TO TOP
      </button>

      {/* Main Footer Columns */}
      <div className="footer-main">
        <div className="footer-container">

          {/* Browse Categories */}
          <div className="footer-col">
            <h4 className="footer-col-title">Browse Categories</h4>
            <ul className="footer-links">
              {['Game Deals', 'Bundles', 'All Games', 'Top Sellers', 'Latest Deals', 'New Releases', 'Upcoming Games'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Games by Genre */}
          <div className="footer-col">
            <h4 className="footer-col-title">Games by Genre</h4>
            <ul className="footer-links">
              {['Action', 'Adventure', 'Co-op', 'Racing', 'RPG', 'Shooter', 'Simulation', 'Sports', 'Strategy', 'View All'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div className="footer-col">
            <h4 className="footer-col-title">Information</h4>
            <ul className="footer-links">
              {['About Bundle Forge', 'Support', 'Community', 'Publishing Partners', 'Affiliate Partners', 'Redeem Code'].map(l => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div className="footer-col">
            <h4 className="footer-col-title">Join our Newsletter</h4>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="newsletter-input"
              />
              <button className="newsletter-btn">Sign Up</button>
            </div>
            <p className="newsletter-note">
              You can unsubscribe via the newsletter at any time. By subscribing to our newsletter you agree to our{' '}
              <a href="#">Privacy Policy</a>.
            </p>
            
            <div style={{ marginTop: '1.25rem' }}>
              <button className="footer-action-btn">Language / Currency &rsaquo;</button>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
};
