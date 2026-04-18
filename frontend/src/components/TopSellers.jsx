import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import './TopSellers.css';

const CartIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor">
    <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20l44 0 0 44c0 11 9 20 20 20s20-9 20-20l0-44 44 0c11 0 20-9 20-20s-9-20-20-20l-44 0 0-44c0-11-9-20-20-20s-20 9-20 20l0 44-44 0c-11 0-20 9-20 20z"/>
  </svg>
);

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
    <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"/>
  </svg>
);

const formatPrice = (price) => `RON ${(price * 4.97).toFixed(2)}`;

export const TopSellers = () => {
  const dispatch = useDispatch();
  const games = useSelector(state => state.games.all);
  const [activeFilter, setActiveFilter] = useState('All Products');

  const filters = ['All Products', 'Games', 'Game Bundles', 'Books & Comics', 'Other'];

  const topSellers = games.slice(0, 11);

  const handleAddToCart = (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(game));
  };

  return (
    <section className="ts-section">
      <div className="ts-container">
        <h2 className="ts-heading">Top Sellers</h2>

        <div className="ts-filter-tabs">
          {filters.map(filter => (
            <button
              key={filter}
              className={`ts-filter-tab ${activeFilter === filter ? 'ts-filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
          <a href="#" className="ts-view-all-link">VIEW ALL</a>
        </div>

        <div className="ts-grid">
          {topSellers.map((game, index) => (
            <div key={game.id} className="ts-card">
              <div className="ts-card-img-wrap">
                <img src={game.image} alt={game.title} className="ts-card-img" />
                {index === 2 && (
                  <span className="ts-deal-badge">DEAL</span>
                )}
              </div>
              <div className="ts-card-bar">
                <div className="ts-card-title">{game.title}</div>

                <div className="ts-card-bottom">
                  <div className="ts-card-icons">
                    <SteamIcon />
                    <WindowsIcon />
                  </div>

                  <div className="ts-card-right">
                    {game.discount > 0 && (
                      <span className="ts-card-discount">-{game.discount}%</span>
                    )}
                    <div className="ts-card-prices">
                      {game.discount > 0 && (
                        <span className="ts-card-was">{formatPrice(game.originalPrice)}</span>
                      )}
                      <span className="ts-card-now">{formatPrice(game.price)}</span>
                    </div>
                    <button
                      className="ts-cart-btn"
                      onClick={(e) => handleAddToCart(game, e)}
                      aria-label="Add to cart"
                    >
                      <CartIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
