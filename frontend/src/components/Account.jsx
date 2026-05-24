import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUser } from '@/redux/slices/authSlice';
import { authService } from '@/services/authService';

const API_URL = import.meta.env.VITE_API_URL;
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
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
  const [changeFirstNameModal, setChangeFirstNameModal] = useState(false);
  const [changeLastNameModal, setChangeLastNameModal] = useState(false);
  const [changePhoneModal, setChangePhoneModal] = useState(false);
  const [latestOrder, setLatestOrder] = useState(null);
  const [latestOrderLoading, setLatestOrderLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const loadCustomerProfile = async () => {
      try {
        const profile = await authService.getCustomerProfile();
        setPersonalDetails({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phoneNumber: profile.phoneNumber || '',
        });
        dispatch(setUser({ user: profile, userType: 'CUSTOMER' }));
      } catch (error) {
        console.error('Failed to load customer profile:', error);
      }
    };

    const loadLatestOrder = async () => {
      try {
        const orders = await authService.getOrders();
        setLatestOrder(orders.length > 0 ? orders[0] : null);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLatestOrderLoading(false);
      }
    };

    if (isAuthenticated) {
      loadCustomerProfile();
      loadLatestOrder();
    }
  }, [isAuthenticated, dispatch]);

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
      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password');
      }

      await authService.changePassword(currentPassword, newPassword);
      setChangePasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setModalError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangeFirstName = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (!newFirstName) {
        throw new Error('Please enter a first name');
      }
      const response = await authService.updateCustomerProfile(
        newFirstName,
        personalDetails.lastName,
        personalDetails.phoneNumber
      );
      dispatch(setUser({ user: response, userType: 'CUSTOMER' }));
      setPersonalDetails(prev => ({
        ...prev,
        firstName: response.firstName || '',
      }));
      setChangeFirstNameModal(false);
    } catch (error) {
      setModalError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangeLastName = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (!newLastName) {
        throw new Error('Please enter a last name');
      }
      const response = await authService.updateCustomerProfile(
        personalDetails.firstName,
        newLastName,
        personalDetails.phoneNumber
      );
      dispatch(setUser({ user: response, userType: 'CUSTOMER' }));
      setPersonalDetails(prev => ({
        ...prev,
        lastName: response.lastName || '',
      }));
      setChangeLastNameModal(false);
    } catch (error) {
      setModalError(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangePhoneNumber = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (!newPhoneNumber) {
        throw new Error('Please enter a phone number');
      }
      const response = await authService.updateCustomerProfile(
        personalDetails.firstName,
        personalDetails.lastName,
        newPhoneNumber
      );
      dispatch(setUser({ user: response, userType: 'CUSTOMER' }));
      setPersonalDetails(prev => ({
        ...prev,
        phoneNumber: response.phoneNumber || '',
      }));
      setChangePhoneModal(false);
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
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => navigate('/coupons-rewards') },
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

              <div className="account-section">
                <h3>Your Latest Order</h3>
                {latestOrderLoading ? (
                  <p>Loading...</p>
                ) : !latestOrder ? (
                  <p>No orders yet. Start browsing games to make your first purchase!</p>
                ) : (
                  <div className="latest-order">
                    <div className="latest-order-meta">
                      <span className="latest-order-date">
                        {new Date(latestOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className={`latest-order-status latest-order-status--${latestOrder.status.toLowerCase()}`}>
                        {latestOrder.status}
                      </span>
                    </div>

                    <div className="latest-order-items">
                      {latestOrder.items.map((item, i) => (
                        <div key={i} className="latest-order-item">
                          {item.cover && (
                            <img
                              src={`${API_URL}${item.cover}`}
                              alt={item.title}
                              className="latest-order-item-cover"
                            />
                          )}
                          <div className="latest-order-item-info">
                            <span className="latest-order-item-title">{item.title}</span>
                            {item.gameKey && (
                              <span className="latest-order-item-key">{item.gameKey}</span>
                            )}
                          </div>
                          <span className="latest-order-item-price">
                            {latestOrder.currency.toUpperCase()} {(item.unitAmount / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="latest-order-total">
                      <span>Total</span>
                      <span>{latestOrder.currency.toUpperCase()} {(latestOrder.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}
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
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">FIRST NAME</p>
                    <p className="detail-value">{personalDetails.firstName || 'Not set'}</p>
                  </div>
                  <button
                    type="button"
                    className="detail-action"
                    onClick={() => {
                      setChangeFirstNameModal(true);
                      setNewFirstName('');
                      setModalError('');
                    }}
                  >
                    Change First Name
                  </button>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">LAST NAME</p>
                    <p className="detail-value">{personalDetails.lastName || 'Not set'}</p>
                  </div>
                  <button
                    type="button"
                    className="detail-action"
                    onClick={() => {
                      setChangeLastNameModal(true);
                      setNewLastName('');
                      setModalError('');
                    }}
                  >
                    Change Last Name
                  </button>
                </div>

                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">PHONE NUMBER</p>
                    <p className="detail-value">{personalDetails.phoneNumber || 'Not set'}</p>
                  </div>
                  <button
                    type="button"
                    className="detail-action"
                    onClick={() => {
                      setChangePhoneModal(true);
                      setNewPhoneNumber('');
                      setModalError('');
                    }}
                  >
                    Change Phone Number
                  </button>
                </div>
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
                  placeholder="Enter new email address..."
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
                  placeholder="Enter current password..."
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
                  placeholder="Enter new password..."
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
                  placeholder="Confirm new password..."
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

      {changeFirstNameModal && (
        <>
          <div className="modal-backdrop" onClick={() => setChangeFirstNameModal(false)} />
          <div className="account-modal">
            <div className="modal-header">
              <h2>Change First Name</h2>
              <button
                className="modal-close"
                onClick={() => setChangeFirstNameModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangeFirstName}>
              {modalError && <div className="form-error">{modalError}</div>}

              <div className="form-group">
                <label>Current First Name</label>
                <input
                  type="text"
                  value={personalDetails.firstName || 'Not set'}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>New First Name</label>
                <input
                  type="text"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="form-input"
                  placeholder="Enter new first name..."
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setChangeFirstNameModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'UPDATING...' : 'UPDATE FIRST NAME'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {changeLastNameModal && (
        <>
          <div className="modal-backdrop" onClick={() => setChangeLastNameModal(false)} />
          <div className="account-modal">
            <div className="modal-header">
              <h2>Change Last Name</h2>
              <button
                className="modal-close"
                onClick={() => setChangeLastNameModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangeLastName}>
              {modalError && <div className="form-error">{modalError}</div>}

              <div className="form-group">
                <label>Current Last Name</label>
                <input
                  type="text"
                  value={personalDetails.lastName || 'Not set'}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>New Last Name</label>
                <input
                  type="text"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="form-input"
                  placeholder="Enter new last name..."
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setChangeLastNameModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'UPDATING...' : 'UPDATE LAST NAME'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {changePhoneModal && (
        <>
          <div className="modal-backdrop" onClick={() => setChangePhoneModal(false)} />
          <div className="account-modal">
            <div className="modal-header">
              <h2>Change Phone Number</h2>
              <button
                className="modal-close"
                onClick={() => setChangePhoneModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePhoneNumber}>
              {modalError && <div className="form-error">{modalError}</div>}

              <div className="form-group">
                <label>Current Phone Number</label>
                <input
                  type="tel"
                  value={personalDetails.phoneNumber || 'Not set'}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-group">
                <label>New Phone Number</label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="form-input"
                  placeholder="Enter new phone number..."
                  required
                  disabled={modalLoading}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setChangePhoneModal(false)}
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'UPDATING...' : 'UPDATE PHONE NUMBER'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
