import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MoreGameBundles.css';
import SteamIcon from '../assets/icons/steam.svg?react';
import ViewIcon from '../assets/icons/view.svg?react';

const API_URL = import.meta.env.VITE_API_URL;
const CARDS_PER_SLIDE = 3;

export const MoreGameBundles = () => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/bundles`)
      .then(r => r.json())
      .then(data => setBundles(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (bundles.length === 0) return null;

  const totalSlides = Math.ceil(bundles.length / CARDS_PER_SLIDE);
  const visibleBundles = bundles.slice(
    slide * CARDS_PER_SLIDE,
    slide * CARDS_PER_SLIDE + CARDS_PER_SLIDE
  );

  return (
    <section className="mgb-section">
      <div className="mgb-container">

        <div className="mgb-header">
          <h2 className="mgb-heading">More Game Bundles</h2>
          <a href="/search" className="mgb-view-all-btn">VIEW ALL</a>
        </div>

        <div className="mgb-slider-wrapper">
          <button
            className="fd-arrow fd-arrow--left"
            onClick={() => setSlide(s => Math.max(0, s - 1))}
            disabled={slide === 0}
            aria-label="Previous"
          >
            <svg viewBox="0 0 320 512">
              <path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
            </svg>
          </button>

          <div className="mgb-cards">
            {visibleBundles.map((bundle) => (
              <div key={bundle.id} className="mgb-card" onClick={() => navigate(`/bundle/${bundle.id}`)} style={{ cursor: 'pointer' }}>
                <div className="mgb-card-img-wrap">
                  <img
                    src={`${API_URL}${bundle.cover}`}
                    alt={bundle.title}
                    className="mgb-card-img"
                    loading="lazy"
                  />
                  <div className="mgb-card-overlay">
                    <span className="mgb-quick-look">{bundle.title}</span>
                    <button
                      className="mgb-view-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/bundle/${bundle.id}`); }}
                    >
                      <ViewIcon />
                      VIEW
                    </button>
                  </div>
                </div>

                <div className="mgb-card-footer">
                  <div className="mgb-card-drm">
                    <SteamIcon width="16" height="16" fill="#fff" />
                    <span className="mgb-card-drm-label">Steam</span>
                  </div>
                  <div className={`mgb-card-timer ${bundle.daysLeft <= 1 ? 'mgb-card-timer--ending' : ''}`}>
                    {bundle.daysLeft <= 1 ? `${bundle.daysLeft} DAY LEFT` : `${bundle.daysLeft} DAYS LEFT`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="fd-arrow fd-arrow--right"
            onClick={() => setSlide(s => Math.min(totalSlides - 1, s + 1))}
            disabled={slide === totalSlides - 1}
            aria-label="Next"
          >
            <svg viewBox="0 0 320 512">
              <path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
            </svg>
          </button>
        </div>

        {totalSlides > 1 && (
          <div className="mgb-dots">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                className={`mgb-dot ${i === slide ? 'mgb-dot--active' : ''}`}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1} of ${totalSlides}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
