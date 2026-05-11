import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchQuery } from '../redux/slices/filtersSlice';
import { toggleCart } from '../redux/slices/uiSlice';
import { logout } from '../redux/slices/authSlice';
import { SignInModal } from './SignInModal';
import AccountIcon from '@/assets/icons/account.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import SignOutIcon from '@/assets/icons/sign-out.svg?react';
import DropdownIcon from '@/assets/icons/dropdown.svg?react';
import logoImg from '@/assets/icons/bundle-forge-logo.svg';
import './Header.css';

export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(state => state.cart.items);
  const searchQuery = useSelector(state => state.filters.searchQuery);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const userEmail = useSelector(state => state.auth.user?.email);
  const userType = useSelector(state => state.auth.userType);

  // Sign-in modal state
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    };

    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="header-container">
            {/* Logo */}
            <a href="/" className="logo">
              <img src={logoImg} alt="Bundle Forge Logo" style={{ width: 'auto', height: '50px' }} />
              <span className="logo-text">BUNDLE FORGE</span>
            </a>

            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search PC, Mac, Linux Games"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="search-input"
              />
              <button className="search-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            </div>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Sign In / My Account */}
              {isAuthenticated ? (
                <div className="account-menu" style={{ position: 'relative' }} ref={accountMenuRef}>
                  <button
                    className="sign-in-btn"
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    My Account
                    <DropdownIcon style={{ width: '16px', height: '16px', fill: 'currentColor' }} />
                  </button>
                  {showAccountMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      minWidth: '220px',
                      zIndex: 100,
                      marginTop: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                    }}>
                      <div style={{ padding: '12px', borderBottom: '1px solid #333', color: '#888', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Logged in as
                      </div>
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid #333', color: '#fff', fontSize: '0.9rem' }}>
                        {userEmail}
                      </div>

                      <a
                        href="/account"
                        onClick={() => setShowAccountMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          color: '#fff',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #222',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#222'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <AccountIcon style={{ width: '16px', height: '16px', minWidth: '16px', fill: 'currentColor' }} />
                        Account Overview
                      </a>

                      {userType === 'DEVELOPER' ? (
                        <a
                          href="/account"
                          onClick={() => setShowAccountMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            color: '#fff',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid #222',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#222'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <LibraryIcon style={{ width: '16px', height: '16px', minWidth: '16px', fill: 'currentColor' }} />
                          My Games
                        </a>
                      ) : (
                        <>
                          <a
                            href="/orders"
                            onClick={() => setShowAccountMenu(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              color: '#fff',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid #222',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#222'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <OrdersIcon style={{ width: '16px', height: '16px', minWidth: '16px', fill: 'currentColor' }} />
                            Order History & Keys
                          </a>

                          <a
                            href="/product-library"
                            onClick={() => setShowAccountMenu(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 12px',
                              color: '#fff',
                              textDecoration: 'none',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid #222',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#222'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            <LibraryIcon style={{ width: '16px', height: '16px', minWidth: '16px', fill: 'currentColor' }} />
                            Product Library
                          </a>
                        </>
                      )}

                      <button
                        onClick={() => {
                          dispatch(logout());
                          setShowAccountMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#f90',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#222'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <SignOutIcon style={{ width: '16px', height: '16px', minWidth: '16px', fill: 'currentColor' }} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="sign-in-btn"
                  onClick={() => setIsSignInOpen(true)}
                >
                  Sign in
                </button>
              )}

              <button
                className="cart-btn"
                onClick={() => navigate('/cart')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                <span className="cart-total">RON {cartTotal.toFixed(2)}</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-bar">
          <div className="nav-container">
            <ul className="nav-menu">
              <li className="nav-item has-dropdown">
                <button className="nav-link">Discover</button>
                <div className="dropdown">
                  <a href="/featured">Featured</a>
                  <a href="/coming-soon">Coming Soon</a>
                  <a href="/deals">Deals</a>
                </div>
              </li>
              <li className="nav-item has-dropdown">
                <button className="nav-link">Categories</button>
                <div className="dropdown">
                  <a href="/action">Action</a>
                  <a href="/rpg">RPG</a>
                  <a href="/strategy">Strategy</a>
                  <a href="/adventure">Adventure</a>
                  <a href="/simulation">Simulation</a>
                </div>
              </li>
              <li className="nav-item has-dropdown">
                <button className="nav-link">Bundles</button>
                <div className="dropdown">
                  <a href="/bundles">All Bundles</a>
                  <a href="/bundles/active">Active</a>
                  <a href="/bundles/upcoming">Upcoming</a>
                </div>
              </li>
              <li className="nav-item"><a href="/upcoming" className="nav-link">Upcoming Games</a></li>
              <li className="nav-item"><a href="/new" className="nav-link">New Releases</a></li>
              <li className="nav-item"><a href="/coupons-rewards" className="nav-link">Coupons & Rewards</a></li>
              <li className="nav-item"><a href="/support" className="nav-link">Support</a></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Sign In Modal — rendered outside header so it overlays everything */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />
    </>
  );
};