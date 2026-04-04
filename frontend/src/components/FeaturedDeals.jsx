import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import './FeaturedDeals.css';

export const FeaturedDeals = () => {
  const dispatch = useDispatch();
  const games = useSelector(state => state.games.all);

  // Get featured games (first 6)
  const featuredGames = games.slice(0, 6);
  const mainFeatured = featuredGames[0];
  const secondaryFeatured = featuredGames.slice(1, 3);
  const cardsFeatured = featuredGames.slice(3, 6);

  const handleAddToCart = (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(game));
  };

  if (!mainFeatured) {
    return null;
  }

  return (
    <section className="featured-deals">
      <div className="featured-deals-container">
        <h2 className="section-title">Featured Deals</h2>

        <div className="featured-grid">
          {/* Main Featured Bundle - Large Card */}
          <div className="featured-card featured-main">
            <div className="featured-card-image">
              <img src={mainFeatured.image} alt={mainFeatured.title} />
              {mainFeatured.discount > 0 && (
                <span className="discount-badge">-{mainFeatured.discount}%</span>
              )}
            </div>
            <div className="featured-card-content">
              <span className="card-category">{mainFeatured.category}</span>
              <h3 className="card-title">{mainFeatured.title}</h3>
              <p className="card-description">{mainFeatured.description}</p>

              <div className="card-meta">
                <div className="card-platform">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <span>STEAM</span>
                </div>
                {mainFeatured.discount > 0 && (
                  <div className="card-pricing">
                    <span className="original-price">${mainFeatured.originalPrice}</span>
                    <span className="current-price">${mainFeatured.price}</span>
                  </div>
                )}
                {!mainFeatured.discount && (
                  <div className="card-pricing">
                    <span className="current-price">${mainFeatured.price}</span>
                  </div>
                )}
              </div>

              <button
                className="add-to-cart-btn"
                onClick={(e) => handleAddToCart(mainFeatured, e)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column - Secondary Featured + Cards */}
          <div className="featured-column">
            {/* Secondary Featured Row */}
            <div className="featured-secondary-row">
              {secondaryFeatured.map((game) => (
                <div key={game.id} className="featured-card featured-secondary">
                  <div className="featured-card-image">
                    <img src={game.image} alt={game.title} />
                    {game.discount > 0 && (
                      <span className="discount-badge">-{game.discount}%</span>
                    )}
                    {game.badge && (
                      <span className="deal-badge">{game.badge}</span>
                    )}
                  </div>
                  <div className="featured-card-content">
                    <span className="card-tag">{game.category}</span>
                    <h4 className="card-title-small">{game.title}</h4>

                    <div className="card-meta">
                      <div className="card-platform">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        <span>STEAM</span>
                      </div>
                      <div className="card-pricing">
                        {game.discount > 0 && (
                          <>
                            <span className="discount-percent">-{game.discount}%</span>
                            <span className="original-price">${game.originalPrice}</span>
                          </>
                        )}
                        <span className="current-price">${game.price}</span>
                      </div>
                    </div>

                    <button
                      className="add-to-cart-btn-small"
                      onClick={(e) => handleAddToCart(game, e)}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Small Cards Row */}
            <div className="featured-cards-row">
              {cardsFeatured.map((game) => (
                <div key={game.id} className="featured-card featured-small">
                  <div className="featured-card-image">
                    <img src={game.image} alt={game.title} />
                    {game.discount > 0 && (
                      <span className="discount-badge">-{game.discount}%</span>
                    )}
                  </div>
                  <div className="featured-card-content">
                    <div className="card-platform-row">
                      <div className="card-platform">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        </svg>
                        <span>STEAM</span>
                      </div>
                      <div className="card-pricing">
                        {game.discount > 0 && (
                          <span className="original-price">${game.originalPrice}</span>
                        )}
                        <span className="current-price">
                          {game.discount > 0 ? `$${game.price}` : `From $${game.price}`}
                        </span>
                      </div>
                    </div>

                    <button
                      className="add-to-cart-btn-small"
                      onClick={(e) => handleAddToCart(game, e)}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
