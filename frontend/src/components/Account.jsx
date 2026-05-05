import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
import SupportIcon from '@/assets/icons/support.svg?react';
import './Account.css';

export const Account = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = useSelector(state => state.auth.user?.email);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (location.pathname === '/account/login') {
      setActiveSection('security');
    } else if (location.pathname === '/account/payment') {
      setActiveSection('payment');
    } else {
      setActiveSection('overview');
    }
  }, [location.pathname]);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => setActiveSection('overview'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => setActiveSection('security'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => setActiveSection('payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => navigate('/orders') },
    { id: 'library', label: 'Product Library', icon: LibraryIcon, action: () => navigate('/product-library') },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => navigate('/coupons-rewards') },
    { id: 'support', label: 'Support', icon: SupportIcon, action: () => navigate('/support') },
  ];

  return (
    <div className="account-container">
      <div className="account-layout">
        <aside className="account-sidebar">
          {menuItems.map(item => (
            <div key={item.id}>
              <button
                className={`sidebar-item ${activeSection === item.id ? 'active' : ''} ${item.isChild ? 'sidebar-item-child' : ''}`}
                onClick={item.action}
              >
                <item.icon className="sidebar-icon" />
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </aside>

        <main className="account-content">
          {activeSection === 'overview' && (
            <div className="account-overview">
              <h1>Account Overview</h1>
              <p className="account-email">{userEmail}</p>

              <div className="account-stats">
                <div className="stat-card">
                  <span className="stat-icon">❤️</span>
                  <span className="stat-number">0</span>
                  <span className="stat-label">WISHLIST</span>
                  <a href="/wishlist" className="stat-link">VIEW WISHLIST</a>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-number">0</span>
                  <span className="stat-label">PRODUCT REVIEWS</span>
                  <a href="#" className="stat-link">VIEW REVIEWS</a>
                </div>
              </div>

              <div className="account-section">
                <h3>Your Latest Order</h3>
                <p>No orders yet. Start browsing games to make your first purchase!</p>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="account-section-view">
              <h1>Login & Security</h1>
              <div className="account-section">
                <h3>Password</h3>
                <p>Change your password regularly to keep your account secure.</p>
                <button className="btn-primary">CHANGE PASSWORD</button>
              </div>

              <div className="account-section">
                <h3>Two-Factor Authentication (2FA)</h3>
                <p>Add an extra layer of security to your account by enabling Two-Factor Authentication (2FA).</p>
                <button className="btn-primary">ENABLE 2FA</button>
              </div>

              <div className="account-section">
                <h3>Active Sessions</h3>
                <p>Manage your active sessions and sign out from other devices.</p>
                <button className="btn-primary">MANAGE SESSIONS</button>
              </div>
            </div>
          )}

          {activeSection === 'payment' && (
            <div className="account-section-view">
              <h1>Payment Information</h1>
              <div className="account-section">
                <h3>Payment Methods</h3>
                <p>Add or remove payment methods for faster checkout.</p>
                <button className="btn-primary">MANAGE PAYMENT METHODS</button>
              </div>

              <div className="account-section">
                <h3>Billing History</h3>
                <p>View and download your invoices and billing history.</p>
                <button className="btn-primary">VIEW BILLING HISTORY</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
