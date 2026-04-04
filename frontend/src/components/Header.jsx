import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery } from '../redux/slices/filtersSlice';
import { toggleCart } from '../redux/slices/uiSlice';
import logoImg from '@/assets/icons/bundle-forge-logo.svg';
import './Header.css';

export const Header = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const searchQuery = useSelector(state => state.filters.searchQuery);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
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
            <a href="/signin" className="sign-in-btn">Sign in</a>

            <button className="wishlist-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {cartCount > 0 && <span className="wishlist-badge">{cartCount}</span>}
            </button>

            <button
              className="cart-btn"
              onClick={() => dispatch(toggleCart())}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <span className="cart-total">${cartTotal.toFixed(2)}</span>
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
            <li className="nav-item"><a href="/mystery" className="nav-link">Mystery</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};