import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setUser } from '@/redux/slices/authSlice';
import { authService } from '@/services/authService';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import SupportIcon from '@/assets/icons/support.svg?react';
import AddDocumentIcon from '@/assets/icons/add-document-icon.svg?react';
import EditDocumentIcon from '@/assets/icons/edit-document-icon.svg?react';
import RemoveDocumentIcon from '@/assets/icons/remove-document-icon.svg?react';
import './Account.css';

export const DeveloperAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const userEmail = user?.email;
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [activeSection, setActiveSection] = useState('overview');
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Security section state
  const [changeEmailModal, setChangeEmailModal] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Load games on component mount
  useEffect(() => {
    if (activeSection === 'my-games') {
      loadDeveloperGames();
    }
  }, [activeSection]);

  // Update active section based on URL
  useEffect(() => {
    if (location.pathname === '/account/login') {
      setActiveSection('security');
    } else {
      setActiveSection('overview');
    }
  }, [location.pathname]);

  const loadDeveloperGames = async () => {
    try {
      setIsLoading(true);
      setError('');
      const gamesList = await authService.getDeveloperGames();
      setGames(gamesList);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
      setModalError('Email change feature coming soon');
    } catch (err) {
      setModalError(err.message);
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
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => setActiveSection('overview'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => setActiveSection('security'), isChild: true },
    { id: 'my-games', label: 'My Games', icon: LibraryIcon, action: () => setActiveSection('my-games'), isParent: true },
    { id: 'add-game', label: 'Add New Game', icon: AddDocumentIcon, action: () => setActiveSection('add-game'), isChild: true },
    { id: 'update-game', label: 'Update Game', icon: EditDocumentIcon, action: () => setActiveSection('update-game'), isChild: true },
    { id: 'remove-game', label: 'Remove Game', icon: RemoveDocumentIcon, action: () => setActiveSection('remove-game'), isChild: true },
    { id: 'support', label: 'Support', icon: SupportIcon, action: () => setActiveSection('support') },
  ];

  if (!isAuthenticated) {
    return (
      <div className="account-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '2rem',
            color: '#888',
            marginBottom: '10px'
          }}>
            🔐
          </div>
          <h1 style={{ color: '#fff', marginBottom: '10px' }}>Sign In Required</h1>
          <p style={{ color: '#999', fontSize: '1rem', marginBottom: '30px' }}>
            Please sign in to view your account details
          </p>
          <button
            onClick={() => navigate('/account')}
            style={{
              backgroundColor: '#f90',
              color: '#000',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            SIGN IN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-layout">
        <aside className="account-sidebar">
          {menuItems.map(item => (
            <div key={item.id}>
              <button
                className={`sidebar-item ${activeSection === item.id ? 'active' : ''} ${item.isChild ? 'sidebar-item-child' : ''} ${item.isSubChild ? 'sidebar-item-subchild' : ''}`}
                onClick={item.action}
              >
                {item.icon && <item.icon className="sidebar-icon" />}
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
                <h3>Developer Profile</h3>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">DISPLAY NAME</p>
                    <p className="detail-value">{user?.displayName || 'Not set'}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">WEBSITE</p>
                    <p className="detail-value">{user?.website || 'Not set'}</p>
                  </div>
                </div>
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
            </div>
          )}

          {activeSection === 'my-games' && (
            <div className="account-section-view">
              <h1>My Games</h1>
              {error && <div style={{ color: '#ff0000', marginBottom: '1rem' }}>{error}</div>}
              {isLoading && <p>Loading games...</p>}
              {!isLoading && games.length === 0 && <p>No games announced yet.</p>}
              {!isLoading && games.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {games.map(game => (
                    <div
                      key={game.id}
                      onClick={() => {
                        setGameDetails(game);
                        setActiveSection('game-detail');
                      }}
                      style={{
                        cursor: 'pointer',
                        border: '1px solid #333',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      {game.cover && <img src={game.cover} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                      <div style={{ padding: '12px', color: '#ccc' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.title}</p>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#888' }}>{game.status}</p>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#f90', fontWeight: 'bold' }}>${game.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'game-detail' && gameDetails && (
            <div className="account-section-view">
              <button onClick={() => { setActiveSection('my-games'); setGameDetails(null); }} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: '#f90', cursor: 'pointer', fontSize: '0.9rem' }}>
                ← Back to My Games
              </button>
              <h1>{gameDetails.title}</h1>
              {gameDetails.cover && <img src={gameDetails.cover} alt={gameDetails.title} style={{ maxWidth: '300px', borderRadius: '4px', marginBottom: '1rem' }} />}

              <div className="account-section">
                <h3>Game Details</h3>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">TITLE</p>
                    <p className="detail-value">{gameDetails.title}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">PRICE</p>
                    <p className="detail-value">${gameDetails.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">STATUS</p>
                    <p className="detail-value">{gameDetails.status}</p>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">
                    <p className="detail-title">DESCRIPTION</p>
                    <p className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{gameDetails.longDescription}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'add-game' && (
            <div className="account-section-view">
              <h1>Add New Game</h1>
              <p style={{ color: '#888' }}>Game creation form coming soon...</p>
            </div>
          )}

          {activeSection === 'update-game' && (
            <div className="account-section-view">
              <h1>Update Game</h1>
              <p style={{ color: '#888' }}>Game update form coming soon...</p>
            </div>
          )}

          {activeSection === 'remove-game' && (
            <div className="account-section-view">
              <h1>Remove Game</h1>
              <p style={{ color: '#888' }}>Game removal form coming soon...</p>
            </div>
          )}

          {activeSection === 'support' && (
            <div className="account-section-view">
              <h1>Support</h1>
              <div className="account-section">
                <h3>Developer Support</h3>
                <p>Welcome to the developer support center. Here you can find resources to help you manage your games.</p>
                <ul style={{ color: '#ccc', lineHeight: '1.8' }}>
                  <li>Developer Documentation</li>
                  <li>API Reference</li>
                  <li>FAQs for Developers</li>
                  <li>Contact Support Team</li>
                </ul>
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
              <button className="modal-close" onClick={() => setChangeEmailModal(false)}>✕</button>
            </div>
            <form onSubmit={handleChangeEmail}>
              {modalError && <div className="form-error">{modalError}</div>}
              <div className="form-group">
                <label>Current Email</label>
                <input type="email" value={userEmail} className="form-input" disabled />
              </div>
              <div className="form-group">
                <label>New Email Address</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="form-input" placeholder="Enter new email address..." required disabled={modalLoading} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setChangeEmailModal(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={modalLoading}>{modalLoading ? 'UPDATING...' : 'UPDATE EMAIL'}</button>
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
              <button className="modal-close" onClick={() => setChangePasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handleChangePassword}>
              {modalError && <div className="form-error">{modalError}</div>}
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-input" placeholder="Enter current password..." required disabled={modalLoading} />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-input" placeholder="Enter new password..." required disabled={modalLoading} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" placeholder="Confirm new password..." required disabled={modalLoading} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setChangePasswordModal(false)} disabled={modalLoading}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={modalLoading}>{modalLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
