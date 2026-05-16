import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SteamIcon from '../assets/icons/steam.svg?react';
import WindowsIcon from '../assets/icons/windows.svg?react';
import AppleIcon from '../assets/icons/apple.svg?react';
import LinuxIcon from '../assets/icons/linux.svg?react';
import CartIcon from '../assets/icons/cart.svg?react';
import ViewIcon from '../assets/icons/view.svg?react';
import { addToCart } from '../redux/slices/cartSlice';
import './FeaturedDeals.css';

const PLATFORM_ICONS = {
  Windows: <WindowsIcon width="12" height="12" />,
  macOS:   <AppleIcon   width="12" height="12" />,
  Linux:   <LinuxIcon   width="12" height="12" />,
};
const PLATFORM_ORDER = ['Windows', 'macOS', 'Linux'];

const PlatformIcons = ({ platforms }) => {
  const set = new Set(platforms ?? []);
  return (
    <>
      {PLATFORM_ORDER.filter(p => set.has(p)).map(p => (
        <span key={p}>{PLATFORM_ICONS[p]}</span>
      ))}
    </>
  );
};

const API_URL = import.meta.env.VITE_API_URL;

const BADGE_CLASS = {
  'Biggest Deals':    'biggest-deals',
  'New Releases':     'new-releases',
  'Bundle Spotlight': 'bundle-spotlight',
  'Staff Picks':      'staff-picks',
};

const effectivePrice = (item) => {
  if (!item.price) return null;
  if (item.discountPercentage > 0) return item.price * (1 - item.discountPercentage / 100);
  return item.price;
};

const ChevronLeft = () => (
  <svg viewBox="0 0 320 512"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 320 512"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
);

export const FeaturedDeals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/featured`)
      .then(r => r.json())
      .then(data => setSlides(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleClick = (item) => {
    navigate(item.type === 'BUNDLE' ? `/bundle/${item.id}` : `/game/${item.id}`);
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    const ep = effectivePrice(item);
    dispatch(addToCart({
      id: item.id,
      title: item.title,
      price: ep ?? item.price,
      originalPrice: item.price,
      discount: item.discountPercentage,
      image: `${API_URL}${item.cover}`,
      quantity: 1,
    }));
  };

  if (slides.length === 0) {
    return (
      <section className="fd-section">
        <div className="fd-container">
          <h2 className="fd-heading">Featured Deals</h2>
          <div className="fd-empty">No featured deals available right now.</div>
        </div>
      </section>
    );
  }

  const { label, main, support } = slides[slide];
  const totalSlides = slides.length;
  const badgeClass = BADGE_CLASS[label] ?? 'staff-picks';
  const ep = effectivePrice(main);

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
            <ChevronLeft />
          </button>

          <div className="fd-panel">
            {/* Main card */}
            <div className="fd-main-card" onClick={() => handleClick(main)}>
              <img
                src={`${API_URL}${main.cover}`}
                alt={main.title}
                className="fd-main-img"
              />
              <div className="fd-main-overlay">
                <div className="fd-main-info">
                  <div className="fd-main-title">{main.title}</div>
                  {main.developer && (
                    <div className="fd-main-desc">{main.developer}</div>
                  )}
                  <div className="fd-main-footer">
                    <div className="fd-main-footer-left">
                      <span className={`fd-category-badge fd-category-badge--${badgeClass}`}>
                        {label}
                      </span>
                      {main.type === 'GAME' && (
                        <div className="fd-main-platform-icons">
                          <SteamIcon width="14" height="14" />
                          <PlatformIcons platforms={main.platforms} />
                        </div>
                      )}
                    </div>

                    {main.type === 'BUNDLE' ? (
                      <button
                        className="fd-main-action-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/bundle/${main.id}`); }}
                        aria-label={`View ${main.title}`}
                      >
                        <ViewIcon />
                      </button>
                    ) : (
                      <div className="fd-main-price-block">
                        {main.discountPercentage > 0 && (
                          <span className="fd-main-discount">-{main.discountPercentage}%</span>
                        )}
                        {ep != null && (
                          <div className="fd-main-prices">
                            {main.discountPercentage > 0 && (
                              <span className="fd-main-was">RON {main.price.toFixed(2)}</span>
                            )}
                            <span className="fd-main-now">RON {ep.toFixed(2)}</span>
                          </div>
                        )}
                        <button
                          className="fd-main-action-btn"
                          onClick={(e) => handleAddToCart(e, main)}
                          aria-label={`Add ${main.title} to cart`}
                        >
                          <CartIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Support grid */}
            <div className="fd-support-grid">
              {support.map((item) => {
                const sep = effectivePrice(item);
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="fd-support-card"
                    onClick={() => handleClick(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="fd-support-img-wrap">
                      <img
                        src={`${API_URL}${item.cover}`}
                        alt={item.title}
                        className="fd-support-img"
                      />
                    </div>
                    <div className="fd-support-bar">
                      <div className="fd-support-title">{item.title}</div>
                      <div className="fd-support-bottom">
                        <div className="fd-support-icons">
                          <SteamIcon width="14" height="14" />
                          {item.type === 'BUNDLE'
                            ? <span className="fd-support-drm">BUNDLE</span>
                            : <PlatformIcons platforms={item.platforms} />
                          }
                        </div>
                        <div className="fd-support-right">
                          {item.discountPercentage > 0 && (
                            <span className="fd-support-discount">-{item.discountPercentage}%</span>
                          )}
                          {sep != null && (
                            <div className="fd-support-prices">
                              {item.discountPercentage > 0 && (
                                <span className="fd-support-was">RON {item.price.toFixed(2)}</span>
                              )}
                              <span className="fd-support-now">RON {sep.toFixed(2)}</span>
                            </div>
                          )}
                          {item.type === 'BUNDLE' ? (
                            <button
                              className="ts-cart-btn"
                              onClick={(e) => { e.stopPropagation(); navigate(`/bundle/${item.id}`); }}
                              aria-label={`View ${item.title}`}
                            >
                              <ViewIcon />
                            </button>
                          ) : (
                            <button
                              className="ts-cart-btn"
                              onClick={(e) => handleAddToCart(e, item)}
                              aria-label={`Add ${item.title} to cart`}
                            >
                              <CartIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="fd-arrow fd-arrow--right"
            onClick={() => setSlide(s => Math.min(totalSlides - 1, s + 1))}
            disabled={slide === totalSlides - 1}
            aria-label="Next"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="fd-dots">
          {slides.map((_, i) => (
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
