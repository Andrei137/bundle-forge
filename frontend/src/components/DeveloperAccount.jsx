import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setUser } from '@/redux/slices/authSlice';
import { authService } from '@/services/authService';

const API_URL = import.meta.env.VITE_API_URL;
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import SupportIcon from '@/assets/icons/support.svg?react';
import AddDocumentIcon from '@/assets/icons/add-document-icon.svg?react';
import EditDocumentIcon from '@/assets/icons/edit-document-icon.svg?react';
import RemoveDocumentIcon from '@/assets/icons/remove-document-icon.svg?react';
import RedYoutubeIcon from '@/assets/icons/red-youtube.svg?react';
import './Account.css';

const STATUS_TRANSITIONS = {
  ANNOUNCED: ['PUBLISHED', 'DELISTED'],
  PUBLISHED: ['DELISTED'],
  DELISTED: ['PUBLISHED']
};

const getValidStatuses = (currentStatus) => {
  if (!currentStatus) return [];
  return STATUS_TRANSITIONS[currentStatus] || [];
};

const getStatusLabel = (status) => {
  const labels = {
    ANNOUNCED: 'Announced',
    PUBLISHED: 'Published',
    DELISTED: 'Delisted'
  };
  return labels[status] || status;
};

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

  // Add game form state
  const [addGameForm, setAddGameForm] = useState({
    title: '',
    price: '',
    shortDescription: '',
    longDescription: '',
    languages: [],
    link: '',
    youtubeIds: [],
    systemRequirements: {}
  });
  const [coverFile, setCoverFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [currentYoutubeId, setCurrentYoutubeId] = useState('');
  const [currentPlatform, setCurrentPlatform] = useState('Windows');
  const [draggedLanguageIndex, setDraggedLanguageIndex] = useState(null);
  const [dragoverLanguageIndex, setDragoverLanguageIndex] = useState(null);
  const [draggedYoutubeIndex, setDraggedYoutubeIndex] = useState(null);
  const [dragoverYoutubeIndex, setDragoverYoutubeIndex] = useState(null);
  const [draggedImageIndex, setDraggedImageIndex] = useState(null);
  const [dragoverImageIndex, setDragoverImageIndex] = useState(null);
  const [platformRequirements, setPlatformRequirements] = useState({
    minimum: { os: '', processor: '', memory: '', graphics: '', graphicsAPI: '', storage: '', note: '' },
    recommended: { os: '', processor: '', memory: '', graphics: '', graphicsAPI: '', storage: '', note: '' }
  });
  const coverFileInputRef = useRef(null);
  const imageFilesInputRef = useRef(null);
  const imageObjectUrlsRef = useRef({});
  const [addGameLoading, setAddGameLoading] = useState(false);
  const [addGameError, setAddGameError] = useState('');

  // Update game form state
  const [selectedUpdateGameId, setSelectedUpdateGameId] = useState(null);
  const [currentGameStatus, setCurrentGameStatus] = useState(null);
  const [updateGameForm, setUpdateGameForm] = useState({
    discountPercentage: 0,
    status: 'PUBLISHED'
  });
  const [updateGameLoading, setUpdateGameLoading] = useState(false);
  const [updateGameError, setUpdateGameError] = useState('');

  // Remove game state
  const [selectedRemoveGameId, setSelectedRemoveGameId] = useState(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [removeGameLoading, setRemoveGameLoading] = useState(false);

  // Create and cache object URLs for image files
  useEffect(() => {
    imageFiles.forEach((file, idx) => {
      if (file instanceof File && !imageObjectUrlsRef.current[idx]) {
        imageObjectUrlsRef.current[idx] = URL.createObjectURL(file);
      }
    });

    return () => {
      Object.values(imageObjectUrlsRef.current).forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      imageObjectUrlsRef.current = {};
    };
  }, [imageFiles]);

  // Load games when navigating to My Games, Update Game, or Remove Game sections
  useEffect(() => {
    if (['my-games', 'update-game', 'remove-game'].includes(activeSection)) {
      loadDeveloperGames();
    }
  }, [activeSection]);

  // Redirect developers from /account to /dev/games
  useEffect(() => {
    if (location.pathname === '/account' || location.pathname === '/account/payment') {
      navigate('/dev/games', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Update active section based on URL
  useEffect(() => {
    if (location.pathname === '/dev/games') {
      setActiveSection('my-games');
    } else if (location.pathname === '/dev/add') {
      setActiveSection('add-game');
    } else if (location.pathname === '/dev/update') {
      setActiveSection('update-game');
    } else if (location.pathname === '/dev/remove') {
      setActiveSection('remove-game');
    } else if (location.pathname === '/account/login') {
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

  const handleAddLanguage = () => {
    if (currentLanguage.trim()) {
      setAddGameForm({
        ...addGameForm,
        languages: [...addGameForm.languages, currentLanguage.trim()]
      });
      setCurrentLanguage('');
    }
  };

  const handleRemoveLanguage = (index) => {
    setAddGameForm({
      ...addGameForm,
      languages: addGameForm.languages.filter((_, i) => i !== index)
    });
  };

  const handleDragStartLanguage = (index) => {
    setDraggedLanguageIndex(index);
  };

  const handleDropLanguage = (dropIndex) => {
    if (draggedLanguageIndex === null || draggedLanguageIndex === dropIndex) return;
    const newLanguages = [...addGameForm.languages];
    [newLanguages[draggedLanguageIndex], newLanguages[dropIndex]] = [newLanguages[dropIndex], newLanguages[draggedLanguageIndex]];
    setAddGameForm({
      ...addGameForm,
      languages: newLanguages
    });
    setDraggedLanguageIndex(null);
  };

  const handleAddYoutubeId = () => {
    if (currentYoutubeId.trim()) {
      setAddGameForm({
        ...addGameForm,
        youtubeIds: [...addGameForm.youtubeIds, currentYoutubeId.trim()]
      });
      setCurrentYoutubeId('');
    }
  };

  const handleRemoveYoutubeId = (index) => {
    setAddGameForm({
      ...addGameForm,
      youtubeIds: addGameForm.youtubeIds.filter((_, i) => i !== index)
    });
  };

  const handleDragStartYoutube = (index) => {
    setDraggedYoutubeIndex(index);
  };

  const handleDragOverYoutube = (index) => {
    setDragoverYoutubeIndex(index);
  };

  const handleDragLeaveYoutube = () => {
    setDragoverYoutubeIndex(null);
  };

  const handleDropYoutube = (dropIndex) => {
    if (draggedYoutubeIndex === null || draggedYoutubeIndex === dropIndex) return;
    const newYoutubeIds = [...addGameForm.youtubeIds];
    [newYoutubeIds[draggedYoutubeIndex], newYoutubeIds[dropIndex]] = [newYoutubeIds[dropIndex], newYoutubeIds[draggedYoutubeIndex]];
    setAddGameForm({
      ...addGameForm,
      youtubeIds: newYoutubeIds
    });
    setDraggedYoutubeIndex(null);
    setDragoverYoutubeIndex(null);
  };

  const getReorderedYoutubeIds = () => {
    if (draggedYoutubeIndex === null || dragoverYoutubeIndex === null) {
      return addGameForm.youtubeIds;
    }
    const reordered = [...addGameForm.youtubeIds];
    [reordered[draggedYoutubeIndex], reordered[dragoverYoutubeIndex]] = [reordered[dragoverYoutubeIndex], reordered[draggedYoutubeIndex]];
    return reordered;
  };

  const handleDragStartImage = (index) => {
    setDraggedImageIndex(index);
  };

  const handleDragOverImage = (index) => {
    setDragoverImageIndex(index);
  };

  const handleDragLeaveImage = () => {
    setDragoverImageIndex(null);
  };

  const handleDropImage = (dropIndex) => {
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) return;
    const newImageFiles = [...imageFiles];
    [newImageFiles[draggedImageIndex], newImageFiles[dropIndex]] = [newImageFiles[dropIndex], newImageFiles[draggedImageIndex]];
    setImageFiles(newImageFiles);
    setDraggedImageIndex(null);
    setDragoverImageIndex(null);
  };

  const handleRemoveImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const getReorderedImages = () => {
    if (draggedImageIndex === null || dragoverImageIndex === null) {
      return imageFiles;
    }
    const reordered = [...imageFiles];
    [reordered[draggedImageIndex], reordered[dragoverImageIndex]] = [reordered[dragoverImageIndex], reordered[draggedImageIndex]];
    return reordered;
  };

  const handleAddPlatform = () => {
    if (currentPlatform && !addGameForm.systemRequirements[currentPlatform]) {
      setAddGameForm({
        ...addGameForm,
        systemRequirements: {
          ...addGameForm.systemRequirements,
          [currentPlatform]: platformRequirements
        }
      });
      setPlatformRequirements({
        minimum: { os: '', processor: '', memory: '', graphics: '', graphicsAPI: '', storage: '', note: '' },
        recommended: { os: '', processor: '', memory: '', graphics: '', graphicsAPI: '', storage: '', note: '' }
      });
    }
  };

  const handleRemovePlatform = (platform) => {
    const newRequirements = { ...addGameForm.systemRequirements };
    delete newRequirements[platform];
    setAddGameForm({
      ...addGameForm,
      systemRequirements: newRequirements
    });
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    setAddGameError('');
    setAddGameLoading(true);

    try {
      if (!addGameForm.title.trim()) throw new Error('Title is required');
      if (!addGameForm.price || addGameForm.price < 0) throw new Error('Valid price is required');
      if (!addGameForm.shortDescription.trim()) throw new Error('Short description is required');
      if (addGameForm.shortDescription.length > 400) throw new Error('Short description must be max 400 characters');
      if (!addGameForm.longDescription.trim()) throw new Error('Long description is required');
      if (addGameForm.languages.length === 0) throw new Error('At least one language is required');
      if (addGameForm.youtubeIds.length === 0) throw new Error('At least one YouTube ID is required');
      if (Object.keys(addGameForm.systemRequirements).length === 0) throw new Error('At least one platform is required');
      if (!coverFile) throw new Error('Cover image is required');
      if (imageFiles.length === 0) throw new Error('At least one game image is required');

      const formData = new FormData();
      formData.append('game', new Blob([JSON.stringify(addGameForm)], { type: 'application/json' }), 'game.json');
      formData.append('cover', coverFile);
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      await authService.announceGame(formData);
      setAddGameForm({
        title: '', price: '', shortDescription: '', longDescription: '', languages: [],
        link: '', youtubeIds: [], systemRequirements: {}
      });
      setCoverFile(null);
      setImageFiles([]);
      setAddGameError('');
      await loadDeveloperGames();
      setActiveSection('my-games');
    } catch (err) {
      setAddGameError(err.message);
    } finally {
      setAddGameLoading(false);
    }
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    setUpdateGameError('');
    setUpdateGameLoading(true);

    try {
      if (!selectedUpdateGameId) throw new Error('No game selected');
      await authService.updateGame(selectedUpdateGameId, updateGameForm);
      setSelectedUpdateGameId(null);
      setUpdateGameForm({ discountPercentage: 0, status: 'DEVELOPED' });
      await loadDeveloperGames();
      setActiveSection('my-games');
    } catch (err) {
      setUpdateGameError(err.message);
    } finally {
      setUpdateGameLoading(false);
    }
  };

  const handleDeleteGame = async () => {
    setRemoveGameLoading(true);

    try {
      if (!selectedRemoveGameId) throw new Error('No game selected');
      await authService.deleteGame(selectedRemoveGameId);
      setSelectedRemoveGameId(null);
      setShowRemoveConfirmation(false);
      await loadDeveloperGames();
      setActiveSection('my-games');
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoveGameLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/dev/games'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'my-games', label: 'My Games', icon: LibraryIcon, action: () => navigate('/dev/games'), isParent: true },
    { id: 'add-game', label: 'Add New Game', icon: AddDocumentIcon, action: () => navigate('/dev/add'), isChild: true },
    { id: 'update-game', label: 'Update Game', icon: EditDocumentIcon, action: () => navigate('/dev/update'), isChild: true },
    { id: 'remove-game', label: 'Remove Game', icon: RemoveDocumentIcon, action: () => navigate('/dev/remove'), isChild: true },
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
                  {games.map(game => {
                    const originalPrice = game.discountPercentage > 0
                      ? game.price / (1 - game.discountPercentage / 100)
                      : game.price;
                    return (
                      <div key={game.id} style={{
                        backgroundColor: '#1a1a1a',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        textAlign: 'center'
                      }} onClick={() => {
                        setGameDetails(game);
                        setActiveSection('game-detail');
                      }}>
                        {game.cover && <img src={`${API_URL}${game.cover}`} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />}
                        <h4 style={{ margin: '0.5rem 0' }}>{game.title}</h4>
                        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#888' }}>Status: {getStatusLabel(game.status)}</p>
                        <div style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                          {game.discountPercentage > 0 && (
                            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.8rem' }}>
                              RON {originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span style={{ color: '#f90', fontWeight: 'bold' }}>
                            RON {game.price.toFixed(2)}
                          </span>
                          {game.discountPercentage > 0 && (
                            <span style={{ color: '#4CAF50', fontSize: '0.85rem' }}>
                              (-{game.discountPercentage}%)
                            </span>
                          )}
                        </div>
                        <button style={{ backgroundColor: '#f90', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '0.5rem' }}>View Details</button>
                      </div>
                    );
                  })}
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
              {gameDetails.cover && <img src={`${API_URL}${gameDetails.cover}`} alt={gameDetails.title} style={{ maxWidth: '300px', borderRadius: '4px', marginBottom: '1rem' }} />}

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
                    <p className="detail-value">RON {gameDetails.price.toFixed(2)}</p>
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
              <form onSubmit={handleCreateGame} style={{ maxWidth: '800px' }}>
                {addGameError && <div className="form-error">{addGameError}</div>}

                <div className="form-group">
                  <label>Game Title *</label>
                  <input type="text" className="form-input" value={addGameForm.title} onChange={(e) => setAddGameForm({...addGameForm, title: e.target.value})} placeholder="Enter game title..." required disabled={addGameLoading} />
                </div>

                <div className="form-group">
                  <label>Price *</label>
                  <input type="number" step="0.01" min="0" className="form-input" value={addGameForm.price} onChange={(e) => setAddGameForm({...addGameForm, price: parseFloat(e.target.value) || ''})} placeholder="0.00" required disabled={addGameLoading} />
                </div>

                <div className="form-group">
                  <label>Cover Image *</label>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) => {
                      setCoverFile(e.target.files?.[0] || null);
                      if (e.target.files?.length) {
                        e.target.value = '';
                      }
                    }}
                    disabled={addGameLoading}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    {coverFile && (
                      <div style={{
                        position: 'relative',
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <img src={URL.createObjectURL(coverFile)} alt="Cover" style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          opacity: 0,
                          transition: 'opacity 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverFile(null);
                            }}
                            disabled={addGameLoading}
                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '20px' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={addGameLoading}
                      style={{
                        backgroundColor: '#1a1a1a',
                        border: '2px dashed #666',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        minHeight: '150px',
                        transition: 'all 0.2s',
                        ':hover': { borderColor: '#f90', backgroundColor: '#262626' }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#f90';
                        e.currentTarget.style.backgroundColor = '#262626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#666';
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>+</span>
                      <span style={{ fontSize: '0.9rem', color: '#888' }}>Upload Cover</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>YouTube Video IDs *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    {getReorderedYoutubeIds().map((id, idx) => {
                      const originalIdx = addGameForm.youtubeIds.indexOf(id);
                      const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
                      return (
                        <div
                          key={originalIdx}
                          draggable
                          onDragStart={() => handleDragStartYoutube(originalIdx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={() => handleDragOverYoutube(originalIdx)}
                          onDragLeave={handleDragLeaveYoutube}
                          onDrop={() => handleDropYoutube(originalIdx)}
                          style={{
                            position: 'relative',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'move',
                            border: dragoverYoutubeIndex === originalIdx ? '2px solid #f90' : 'none',
                            opacity: draggedYoutubeIndex === originalIdx ? 0.6 : 1,
                            transform: dragoverYoutubeIndex === originalIdx && draggedYoutubeIndex !== null ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <img src={thumbnailUrl} alt={`YouTube ${id}`} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s'
                          }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ color: '#888', fontSize: '0.8rem', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', padding: '0 8px' }}>{id}</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveYoutubeId(originalIdx);
                                }}
                                disabled={addGameLoading}
                                style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '20px', marginTop: '4px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            pointerEvents: 'none'
                          }}>
                            <RedYoutubeIcon width="32" height="32" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }} />
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const id = prompt('Enter YouTube Video ID:');
                        if (id && id.trim()) {
                          setAddGameForm({
                            ...addGameForm,
                            youtubeIds: [...addGameForm.youtubeIds, id.trim()]
                          });
                        }
                      }}
                      disabled={addGameLoading}
                      style={{
                        backgroundColor: '#1a1a1a',
                        border: '2px dashed #666',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        minHeight: '150px',
                        transition: 'all 0.2s',
                        color: 'inherit'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#f90';
                        e.currentTarget.style.backgroundColor = '#262626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#666';
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>+</span>
                      <span style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center' }}>Add YouTube<br />Video ID</span>
                    </button>
                  </div>
                </div>


                <div className="form-group">
                  <label>Game Images *</label>
                  <input
                    ref={imageFilesInputRef}
                    type="file"
                    className="form-input"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      setImageFiles([...imageFiles, ...Array.from(e.target.files || [])]);
                      if (e.target.files?.length) {
                        e.target.value = '';
                      }
                    }}
                    disabled={addGameLoading}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    {getReorderedImages().map((file, displayIdx) => {
                      if (!file) return null;
                      let actualIdx = -1;
                      for (let i = 0; i < imageFiles.length; i++) {
                        if (imageFiles[i] === file) {
                          actualIdx = i;
                          break;
                        }
                      }
                      if (actualIdx === -1) return null;
                      const imageUrl = imageObjectUrlsRef.current[actualIdx] || '';
                      return (
                        <div
                          key={actualIdx}
                          draggable
                          onDragStart={() => handleDragStartImage(actualIdx)}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnter={() => handleDragOverImage(actualIdx)}
                          onDragLeave={handleDragLeaveImage}
                          onDrop={() => handleDropImage(actualIdx)}
                          style={{
                            position: 'relative',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: 'move',
                            border: dragoverImageIndex === actualIdx ? '2px solid #f90' : 'none',
                            opacity: draggedImageIndex === actualIdx ? 0.6 : 1,
                            transform: dragoverImageIndex === actualIdx && draggedImageIndex !== null ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s'
                          }}
                        >
                          <img src={imageUrl} alt={file.name} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s'
                          }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ color: '#888', fontSize: '0.8rem', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px', padding: '0 8px' }}>{file.name}</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(actualIdx);
                                }}
                                disabled={addGameLoading}
                                style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '20px', marginTop: '4px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => imageFilesInputRef.current?.click()}
                      disabled={addGameLoading}
                      style={{
                        backgroundColor: '#1a1a1a',
                        border: '2px dashed #666',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        minHeight: '150px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#f90';
                        e.currentTarget.style.backgroundColor = '#262626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#666';
                        e.currentTarget.style.backgroundColor = '#1a1a1a';
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>+</span>
                      <span style={{ fontSize: '0.9rem', color: '#888' }}>Add Images</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Description (max 400 chars) *</label>
                  <textarea className="form-input" value={addGameForm.shortDescription} onChange={(e) => setAddGameForm({...addGameForm, shortDescription: e.target.value})} placeholder="Brief description..." maxLength="400" required disabled={addGameLoading} style={{ minHeight: '80px' }} />
                  <small style={{ color: '#888' }}>{addGameForm.shortDescription.length}/400</small>
                </div>

                <div className="form-group">
                  <label>Long Description *</label>
                  <textarea className="form-input" value={addGameForm.longDescription} onChange={(e) => setAddGameForm({...addGameForm, longDescription: e.target.value})} placeholder="Detailed game description..." required disabled={addGameLoading} style={{ minHeight: '120px' }} />
                </div>

                <div className="form-group">
                  <label>Languages *</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="text" className="form-input" value={currentLanguage} onChange={(e) => setCurrentLanguage(e.target.value)} placeholder="e.g., English" disabled={addGameLoading} style={{ flex: 1 }} />
                    <button type="button" className="btn-primary" onClick={handleAddLanguage} disabled={addGameLoading}>Add</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {addGameForm.languages.map((lang, idx) => (
                      <div
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStartLanguage(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropLanguage(idx)}
                        style={{
                          backgroundColor: draggedLanguageIndex === idx ? '#ff6b00' : '#f90',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          display: 'flex',
                          gap: '4px',
                          alignItems: 'center',
                          cursor: 'move',
                          opacity: draggedLanguageIndex === idx ? 0.7 : 1,
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>⋮⋮</span>
                        <span>{lang}</span>
                        <button type="button" onClick={() => handleRemoveLanguage(idx)} disabled={addGameLoading} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Link (optional)</label>
                  <input type="url" className="form-input" value={addGameForm.link} onChange={(e) => setAddGameForm({...addGameForm, link: e.target.value})} placeholder="https://..." disabled={addGameLoading} />
                </div>

                <div className="form-group">
                  <label>System Requirements *</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <select className="form-input" value={currentPlatform} onChange={(e) => setCurrentPlatform(e.target.value)} disabled={addGameLoading} style={{ flex: 1 }}>
                      <option value="Windows">Windows</option>
                      <option value="macOS">macOS</option>
                      <option value="Linux">Linux</option>
                    </select>
                    <button type="button" className="btn-primary" onClick={handleAddPlatform} disabled={addGameLoading || Object.keys(addGameForm.systemRequirements).includes(currentPlatform)}>Add Platform</button>
                  </div>

                  {Object.keys(addGameForm.systemRequirements).map(platform => (
                    <div key={platform} style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0 }}>{platform}</h4>
                        <button type="button" onClick={() => handleRemovePlatform(platform)} disabled={addGameLoading} style={{ background: 'none', border: 'none', color: '#f90', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                      </div>

                      {['minimum', 'recommended'].map(type => (
                        <div key={type} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #333' }}>
                          <h5 style={{ margin: '0 0 12px 0', color: '#f90' }}>{type.charAt(0).toUpperCase() + type.slice(1)} Requirements</h5>
                          {['os', 'processor', 'memory', 'graphics', 'graphicsAPI', 'storage', 'note'].map(field => (
                            <div key={field} style={{ marginBottom: '8px' }}>
                              <label style={{ fontSize: '0.9rem' }}>{field.charAt(0).toUpperCase() + field.slice(1)}{field !== 'note' ? ' *' : ''}</label>
                              <input type="text" className="form-input" placeholder={`Enter ${field}...`} disabled={addGameLoading} value={addGameForm.systemRequirements[platform][type][field] || ''} onChange={(e) => setAddGameForm({
                                ...addGameForm,
                                systemRequirements: {
                                  ...addGameForm.systemRequirements,
                                  [platform]: {
                                    ...addGameForm.systemRequirements[platform],
                                    [type]: {
                                      ...addGameForm.systemRequirements[platform][type],
                                      [field]: e.target.value
                                    }
                                  }
                                }
                              })} style={{ fontSize: '0.9rem' }} required={field !== 'note'} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => {
                    setAddGameForm({
                      title: '', price: '', shortDescription: '', longDescription: '', languages: [],
                      link: '', youtubeIds: [], systemRequirements: {}
                    });
                    setCoverFile(null);
                    setImageFiles([]);
                    setAddGameError('');
                  }} disabled={addGameLoading}>Reset</button>
                  <button type="submit" className="btn-primary" disabled={addGameLoading}>{addGameLoading ? 'CREATING...' : 'CREATE GAME'}</button>
                </div>
              </form>
            </div>
          )}

          {activeSection === 'update-game' && (
            <div className="account-section-view">
              <h1>Update Game</h1>
              {!selectedUpdateGameId ? (
                <>
                  {error && <div style={{ color: '#ff0000', marginBottom: '1rem' }}>{error}</div>}
                  {isLoading && <p>Loading games...</p>}
                  {!isLoading && games.length === 0 && <p>No games available to update.</p>}
                  {!isLoading && games.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      {games.map(game => (
                        <div key={game.id} style={{
                          backgroundColor: '#1a1a1a',
                          padding: '1rem',
                          borderRadius: '8px',
                          border: '1px solid #333',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          textAlign: 'center'
                        }} onClick={() => {
                          const gameStatus = game.status || 'ANNOUNCED';
                          setSelectedUpdateGameId(game.id);
                          setCurrentGameStatus(gameStatus);
                          const validTransitions = getValidStatuses(gameStatus);
                          setUpdateGameForm({
                            discountPercentage: game.discountPercentage || 0,
                            status: validTransitions.length > 0 ? validTransitions[0] : gameStatus
                          });
                        }}>
                          {game.cover && <img src={`${API_URL}${game.cover}`} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />}
                          <h4 style={{ margin: '0.5rem 0' }}>{game.title}</h4>
                          <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#888' }}>Status: {getStatusLabel(game.status)}</p>
                          <button style={{ backgroundColor: '#f90', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <form onSubmit={handleUpdateGame} style={{ maxWidth: '600px' }}>
                  {updateGameError && <div className="form-error">{updateGameError}</div>}

                  <button type="button" className="btn-secondary" onClick={() => {
                    setSelectedUpdateGameId(null);
                    setCurrentGameStatus(null);
                  }} disabled={updateGameLoading} style={{ marginBottom: '1rem' }}>← Back to Game List</button>

                  <div className="form-group">
                    <label>Discount Percentage (0-100) *</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="range" min="0" max="100" className="form-input" value={updateGameForm.discountPercentage} onChange={(e) => setUpdateGameForm({...updateGameForm, discountPercentage: parseInt(e.target.value)})} disabled={updateGameLoading} style={{ flex: 1, height: '40px' }} />
                      <input type="number" min="0" max="100" className="form-input" value={updateGameForm.discountPercentage} onChange={(e) => setUpdateGameForm({...updateGameForm, discountPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})} disabled={updateGameLoading} style={{ width: '80px' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Game Status * (Current: {getStatusLabel(currentGameStatus)})</label>
                    {getValidStatuses(currentGameStatus).length === 0 ? (
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>No valid transitions available for this status</p>
                    ) : (
                      <select className="form-input" value={updateGameForm.status} onChange={(e) => setUpdateGameForm({...updateGameForm, status: e.target.value})} disabled={updateGameLoading} required>
                        <option value="">Select a status...</option>
                        {getValidStatuses(currentGameStatus).map(status => (
                          <option key={status} value={status}>
                            {getStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => {
                      setSelectedUpdateGameId(null);
                      setCurrentGameStatus(null);
                    }} disabled={updateGameLoading}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={updateGameLoading}>{updateGameLoading ? 'UPDATING...' : 'UPDATE GAME'}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeSection === 'remove-game' && (
            <div className="account-section-view">
              <h1>Remove Game</h1>
              {error && <div style={{ color: '#ff0000', marginBottom: '1rem' }}>{error}</div>}
              {isLoading && <p>Loading games...</p>}
              {!isLoading && games.length === 0 && <p>No games available to remove.</p>}
              {!isLoading && games.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {games.map(game => (
                    <div key={game.id} style={{
                      backgroundColor: '#1a1a1a',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #333',
                      textAlign: 'center'
                    }}>
                      {game.cover && <img src={`${API_URL}${game.cover}`} alt={game.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />}
                      <h4 style={{ margin: '0.5rem 0' }}>{game.title}</h4>
                      <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#888' }}>Status: {game.status}</p>
                      <button onClick={() => {
                        setSelectedRemoveGameId(game.id);
                        setShowRemoveConfirmation(true);
                      }} style={{ backgroundColor: '#ff4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
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

      {showRemoveConfirmation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => !removeGameLoading && setShowRemoveConfirmation(false)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ marginBottom: '30px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2" width="60" height="60" style={{ margin: '0 auto', display: 'block' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" />
                  <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <h2 style={{ margin: '0 0 15px 0', fontSize: '1.3rem', color: '#000' }}>Delete Game</h2>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
                Are you sure you want to delete this game? This action will delist the game and it will no longer be visible to customers.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button type="button" onClick={() => setShowRemoveConfirmation(false)} disabled={removeGameLoading} style={{ padding: '12px 24px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', color: '#333', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  CANCEL
                </button>
                <button type="button" onClick={handleDeleteGame} disabled={removeGameLoading} style={{ padding: '12px 24px', borderRadius: '4px', border: 'none', backgroundColor: '#ff4444', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {removeGameLoading ? 'DELETING...' : 'DELETE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
