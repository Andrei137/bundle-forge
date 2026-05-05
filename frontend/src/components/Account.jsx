import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUser } from '@/redux/slices/authSlice';
import { authService } from '@/services/authService';
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
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userEmail = user?.email;
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [activeSection, setActiveSection] = useState('overview');
  const [personalDetails, setPersonalDetails] = useState({ firstName: '', lastName: '', phoneNumber: '' });
  const [personalDetailsError, setPersonalDetailsError] = useState('');
  const [personalDetailsSuccess, setPersonalDetailsSuccess] = useState('');
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [changeEmailModal, setChangeEmailModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setPersonalDetails({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/account/login') {
      setActiveSection('security');
    } else if (location.pathname === '/account/payment') {
      setActiveSection('payment');
    } else {
      setActiveSection('overview');
    }
  }, [location.pathname]);

  const handleUpdatePersonalDetails = async (e) => {
    e.preventDefault();
    setLoadingPersonal(true);
    setPersonalDetailsError('');
    setPersonalDetailsSuccess('');

    try {
      const response = await authService.updateCustomerProfile(
        personalDetails.firstName,
        personalDetails.lastName,
        personalDetails.phoneNumber
      );
      dispatch(setUser({ user: response, userType: 'CUSTOMER' }));
      setPersonalDetailsSuccess('Profile updated successfully');
      setTimeout(() => setPersonalDetailsSuccess(''), 3000);
    } catch (error) {
      setPersonalDetailsError(error.message);
    } finally {
      setLoadingPersonal(false);
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (!newEmail || newEmail === userEmail) {
        throw new Error('Please enter a different email address');
      }
      // API call to change email - endpoint TBD
      // await authService.changeEmail(newEmail);
      setModalError('Email change feature coming soon');
      // For now, just show a placeholder message
    } catch (error) {
      setModalError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Please fill in all password fields');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      // API call to change password - endpoint TBD
      // await authService.changePassword(currentPassword, newPassword);
      setModalError('Password change feature coming soon');
      // For now, just show a placeholder message
    } catch (error) {
      setModalError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

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

              <div className="login-details-section">
                <h3>Login Details</h3>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">EMAIL ADDRESS</p>
                    <p className="detail-value">{userEmail}</p>
                  </div>
                  <button
                    type="button"
                    className="detail-action"
                    onClick={() => {
                      setChangeEmailModal(true);
                      setNewEmail('');
                      setModalError('');
                    }}
                  >
                    Change Email Address
                  </button>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">PASSWORD</p>
                    <p className="detail-value">••••••••</p>
                  </div>
                  <button
                    type="button"
                    className="detail-action"
                    onClick={() => {
                      setChangePasswordModal(true);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setModalError('');
                    }}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="personal-details-section">
                <h3>Personal Details</h3>
                {personalDetailsError && <div className="form-error">{personalDetailsError}</div>}
                {personalDetailsSuccess && <div className="form-success">{personalDetailsSuccess}</div>}

                <form onSubmit={handleUpdatePersonalDetails}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={personalDetails.firstName}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, firstName: e.target.value })}
                      className="form-input"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={personalDetails.lastName}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, lastName: e.target.value })}
                      className="form-input"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={personalDetails.phoneNumber}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, phoneNumber: e.target.value })}
                      className="form-input"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <button type="submit" className="btn-primary" disabled={loadingPersonal}>
                    {loadingPersonal ? 'UPDATING...' : 'UPDATE'}
                  </button>
                </form>
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

      {changeEmailModal && (
        <>
          <div className="modal-backdrop" onClick={() => setChangeEmailModal(false)} />
          <div className="account-modal">
            <div className="modal-header">
              <h2>Change Email Address</h2>
              <button
                className="modal-close"
                onClick={() => setChangeEmailModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangeEmail}>
              {modalError && <div className="form-error">{modalError}</div>}

              <div className="form-group">
                <label>Current Email</label>
                <input
                  type="email"
                  value={userEmail}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>New Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter new email address"
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setChangeEmailModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'UPDATING...' : 'UPDATE EMAIL'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {changePasswordModal && (
        <>
          <div className="modal-backdrop" onClick={() => setChangePasswordModal(false)} />
          <div className="account-modal">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button
                className="modal-close"
                onClick={() => setChangePasswordModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              {modalError && <div className="form-error">{modalError}</div>}

              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter current password"
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter new password"
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm new password"
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setChangePasswordModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
