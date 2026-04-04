import { useDispatch, useSelector } from 'react-redux';
import {
  toggleCategory,
  togglePlatform,
  setPriceRange,
  resetFilters
} from '../redux/slices/filtersSlice';
import './Sidebar.css';

const CATEGORIES = ['Action RPG', 'RPG', 'Action', 'Adventure'];
const PLATFORMS = ['PC', 'PS5', 'Xbox'];

export const Sidebar = () => {
  const dispatch = useDispatch();
  const filters = useSelector(state => state.filters);

  const handleCategoryToggle = (category) => {
    dispatch(toggleCategory(category));
  };

  const handlePlatformToggle = (platform) => {
    dispatch(togglePlatform(platform));
  };

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value);
    dispatch(setPriceRange([filters.priceRange[0], value]));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Filters</h2>
        <button className="reset-btn" onClick={handleResetFilters}>
          Reset
        </button>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Price Range</h3>
        <div className="price-filter">
          <input
            type="range"
            min="0"
            max="100"
            value={filters.priceRange[1]}
            onChange={handlePriceChange}
            className="price-slider"
          />
          <div className="price-display">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Category</h3>
        <div className="checkbox-group">
          {CATEGORIES.map(category => (
            <label key={category} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.selectedCategories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="checkbox-input"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Platform</h3>
        <div className="checkbox-group">
          {PLATFORMS.map(platform => (
            <label key={platform} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.selectedPlatforms.includes(platform)}
                onChange={() => handlePlatformToggle(platform)}
                className="checkbox-input"
              />
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Active Filters</h3>
        <div className="active-filters">
          {filters.selectedCategories.length === 0 &&
            filters.selectedPlatforms.length === 0 &&
            filters.searchQuery === '' ? (
            <p className="no-filters">No filters applied</p>
          ) : (
            <>
              {filters.selectedCategories.map(cat => (
                <span key={cat} className="filter-tag">
                  {cat} ✕
                </span>
              ))}
              {filters.selectedPlatforms.map(plat => (
                <span key={plat} className="filter-tag">
                  {plat} ✕
                </span>
              ))}
              {filters.searchQuery && (
                <span className="filter-tag">
                  {filters.searchQuery} ✕
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
