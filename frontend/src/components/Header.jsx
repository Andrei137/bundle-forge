import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, setSortBy } from '../redux/slices/filtersSlice';
import { toggleCart } from '../redux/slices/uiSlice';
import './Header.css';

export const Header = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const searchQuery = useSelector(state => state.filters.searchQuery);
  const sortBy = useSelector(state => state.filters.sortBy);

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSortChange = (e) => {
    dispatch(setSortBy(e.target.value));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top">
          <div className="logo">
            <h1>🎮 Bundle Forge</h1>
          </div>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search games, bundles..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="header-actions">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>

            <button
              className="cart-button"
              onClick={() => dispatch(toggleCart())}
            >
              <span className="cart-icon">🛒</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
