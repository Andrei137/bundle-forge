import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import './TopSellers.css';

export const TopSellers = () => {
  const dispatch = useDispatch();
  const games = useSelector(state => state.games.all);
  const [activeFilter, setActiveFilter] = useState('All Products');

  const filters = ['All Products', 'Games', 'Game Bundles', 'Books & Comics', 'Other'];

  // Get top sellers (first 11 games for the grid layout)
  const topSellers = games.slice(0, 11);

  const handleAddToCart = (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(game));
  };

  const formatPrice = (price) => {
    const ronPrice = (price * 4.97).toFixed(2);
    return `RON ${ronPrice}`;
  };

  return (
    <section className="top-sellers">
      <div className="top-sellers-container">
        <div className="top-sellers-header">
          <h2 className="section-title">Top Sellers</h2>
        </div>

        <div className="filter-tabs">
          {filters.map(filter => (
            <button
              key={filter}
              className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
          <a href="#" className="view-all-link" style={{ marginLeft: 'auto' }}>VIEW ALL</a>
        </div>

        <div className="top-sellers-grid">
          {topSellers.map((game, index) => (
            <div key={game.id} className={`top-seller-card ${index === 0 ? 'card-large' : ''}`}>
              <div className="card-image-wrapper">
                <img src={game.image} alt={game.title} />
                {game.discount > 0 && (
                  <span className="discount-badge">-{game.discount}%</span>
                )}
                {index === 2 && (
                  <span className="deal-badge">DEAL</span>
                )}
              </div>
              <div className="card-footer">
                <div className="card-platform">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <span>STEAM</span>
                </div>
                <div className="card-pricing">
                  {game.discount > 0 && (
                    <>
                      <span className="discount-percent">-{game.discount}%</span>
                      <span className="original-price">{formatPrice(game.originalPrice)}</span>
                    </>
                  )}
                  <span className="current-price">{formatPrice(game.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
