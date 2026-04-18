import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import './FeaturedDeals.css';

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

const CATEGORY_LABELS = ['Category Sale', 'Publisher Sale', 'Star Deal', 'Bundle Deal', 'Flash Sale'];

export const FeaturedDeals = () => {
  const dispatch = useDispatch();
  const games = useSelector(state => state.games.all);
  const [slide, setSlide] = useState(0);

  if (!games.length) return null;

  // Group into slides: 1 main + 4 support per slide
  const ITEMS_PER_SLIDE = 5;
  const totalSlides = Math.ceil(games.length / ITEMS_PER_SLIDE);
  const slideGames = games.slice(slide * ITEMS_PER_SLIDE, slide * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE);
  const mainGame = slideGames[0];
  const supportGames = slideGames.slice(1, 5);

  const handleAddToCart = (game, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(game));
  };

  const categoryLabel = CATEGORY_LABELS[slide % CATEGORY_LABELS.length];

  return (
    <section className="fd-section">
      <div className="fd-container">
        <h2 className="fd-heading">Featured Deals</h2>

        <div className="fd-slider-wrapper">
          <button
            className="fd-arrow fd-arrow--left"
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            aria-label="Previous"
          >
            <svg viewBox="0 0 320 512"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
          </button>

          <div className="fd-panel">
            {mainGame && (
              <div className="fd-main-card">
                <img src={mainGame.image} alt={mainGame.title} className="fd-main-img" />
                <div className="fd-main-overlay">
                  <div className="fd-main-info">
                    <div className="fd-main-title">{mainGame.title}</div>
                    {mainGame.description && (
                      <div className="fd-main-desc">
                        Including: <span>{mainGame.description}</span>
                      </div>
                    )}
                    <div className="fd-main-footer">
                      <span className={`fd-category-badge fd-category-badge--${categoryLabel.toLowerCase().replace(' ', '-')}`}>
                        {categoryLabel}
                      </span>
                      <button className="fd-view-btn" onClick={(e) => handleAddToCart(mainGame, e)} aria-label="View">
                        <svg viewBox="0 0 512 512" fill="currentColor">
                          <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zm395.3 11.3l-112 112c-4.6 4.6-11.5 5.9-17.4 3.5s-9.9-8.3-9.9-14.8l0-64-96 0c-17.7 0-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32l96 0 0-64c0-6.5 3.9-12.3 9.9-14.8s12.9-1.1 17.4 3.5l112 112c6.2 6.2 6.2 16.4 0 22.6z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="fd-support-grid">
              {supportGames.map((game) => (
                <div key={game.id} className="fd-support-card">
                  <div className="fd-support-img-wrap">
                    <img src={game.image} alt={game.title} className="fd-support-img" />
                  </div>
                  <div className="fd-support-bar">
                    <div className="fd-support-title">{game.title}</div>
                    
                    <div className="fd-support-bottom">
                      <div className="fd-support-icons">
                        <SteamIcon />
                        <WindowsIcon />
                      </div>

                      <div className="fd-support-right">
                        {game.discount > 0 && (
                          <span className="fd-support-discount">-{game.discount}%</span>
                        )}
                        <div className="fd-support-prices">
                          {game.discount > 0 && (
                            <span className="fd-support-was">{formatPrice(game.originalPrice)}</span>
                          )}
                          <span className="fd-support-now">{formatPrice(game.price)}</span>
                        </div>
                        <button
                          className="fd-cart-btn"
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

          <button
            className="fd-arrow fd-arrow--right"
            onClick={() => setSlide(s => Math.min(totalSlides - 1, s + 1))}
            disabled={slide === totalSlides - 1}
            aria-label="Next"
          >
            <svg viewBox="0 0 320 512"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
          </button>
        </div>

        <div className="fd-dots">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              className={`fd-dot ${i === slide ? 'fd-dot--active' : ''}`}
              onClick={() => setSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};