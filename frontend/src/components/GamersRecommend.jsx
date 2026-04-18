import { useState } from 'react';
import { useSelector } from 'react-redux';
import './GamersRecommend.css';

const MOCK_REVIEWS = [
  { reviewer: 'Raven181', helpful: 6, quote: '"Tons of fun even for a first time Warhammer player. The combat is brutal, satisfying and keeps you wanting more."', tags: ['Action', 'Third-Person Shooter', 'Action-Adventure', 'Adventure', 'Wargame', 'Sci-fi'] },
  { reviewer: 'Bitek', helpful: 4, quote: '"I\'m glad I didn\'t listen to all the negative comments. BL4 is a really great game. The silver lining of all the fuss about its performance is that I managed to get it on sale."', tags: ['Looter Shooter', 'FPS', 'Action RPG', 'Action-Adventure', 'RPG', 'Action'] },
  { reviewer: 'time2hyde', helpful: 20, quote: '"This game is really fun. It has a Diablo-esque feel to it, as well as elements of Valheim and Conan. The nature of the character you play makes it feel truly unique."', tags: ['Base Building', 'Crafting', 'Survival', 'Hack and Slash', 'Exploration', 'Building'] },
  { reviewer: 'Fr0zenIc3', helpful: 5, quote: '"It\'s amazing, worth every penny. The combat system is incredibly polished and the scale of battles is unlike anything I\'ve experienced before."', tags: ['Hack and Slash', 'Spectacle Fighter', 'Action RPG', 'Action', 'Wargame', 'Martial Arts'] },
  { reviewer: 'Paradox Studios', helpful: 3, quote: '"The game overall is fun and a lot of things have been changed since the last version. Despite some performance issues on launch, it\'s pretty decent and getting better."', tags: ['Simulation', 'Farming Sim', 'Time Management', 'Building', 'Immersive Sim', 'Realistic'] },
  { reviewer: 'V', helpful: 8, quote: '"Graphics and physics are fascinating. The new Gore feature is just amazing. Story could be a bit longer but it\'s well written with side quests that feel meaningful."', tags: ['Action', 'Crafting', 'Survival Horror', 'RPG', 'Adventure', 'Survival'] },
];

const StarRating = ({ count = 5, filled = 5 }) => (
  <div className="gr-stars">
    {Array.from({ length: count }, (_, i) => (
      <svg key={i} className={`gr-star ${i < filled ? 'gr-star--filled' : ''}`} viewBox="0 0 90 90">
        <polygon points="45 0 58.91 29.63 90 34.38 67.5 57.44 72.81 90 45 74.63 17.19 90 22.5 57.44 0 34.38 31.09 29.63 45 0" />
      </svg>
    ))}
  </div>
);

export const GamersRecommend = () => {
  const games = useSelector(state => state.games.all);
  const [current, setCurrent] = useState(0);

  const slides = games.slice(0, MOCK_REVIEWS.length).map((game, i) => ({
    ...game,
    ...MOCK_REVIEWS[i % MOCK_REVIEWS.length],
  }));

  if (!slides.length) return null;

  const slide = slides[current];
  const formatPrice = (price) => `RON ${(price * 4.97).toFixed(2)}`;

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);

  return (
    <section className="gr-section">
      <div className="gr-container">

        {/* Header */}
        <div className="gr-header">
          <h2 className="gr-title">Bundle Forge Gamers Recommend</h2>
          <a href="#" className="gr-view-all">VIEW ALL</a>
        </div>

        {/* Slider */}
        <div className="gr-slider">
          {/* Left Arrow */}
          <button className="gr-arrow gr-arrow--left" onClick={prev} disabled={current === 0} aria-label="Previous">
            <svg viewBox="0 0 320 512"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
          </button>

          {/* Card */}
          <div className="gr-card">
            {/* Left: Image */}
            <div className="gr-card-left">
              {slide.discount > 0 && (
                <div className="gr-price-overlay">
                  <span className="gr-discount-badge">-{slide.discount}%</span>
                  <div className="gr-price-stack">
                    <span className="gr-was-price">{formatPrice(slide.originalPrice)}</span>
                    <span className="gr-now-price">{formatPrice(slide.price)}</span>
                  </div>
                </div>
              )}
              <button className="gr-wishlist-btn" aria-label="Add to wishlist">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <img src={slide.image} alt={slide.title} className="gr-cover-img" />
              {/* Slide progress bar */}
              <div className="gr-progress-bar">
                <div className="gr-progress-fill" style={{ width: `${((current + 1) / slides.length) * 100}%` }} />
              </div>
            </div>

            {/* Right: Info */}
            <div className="gr-card-right">
              <h3 className="gr-game-title">{slide.title}</h3>
              <StarRating filled={5} />

              <div className="gr-tags">
                {(slide.tags || []).map(tag => (
                  <span key={tag} className="gr-tag">{tag}</span>
                ))}
              </div>

              <p className="gr-review-quote">{slide.quote}</p>

              <a href="#" className="gr-read-full">Read full review</a>

              <div className="gr-card-bottom">
                <span className="gr-reviewer">{slide.reviewer}</span>
                <div className="gr-helpful">
                  <span className="gr-helpful-text">{slide.helpful} people found this helpful</span>
                  <button className="gr-like-btn">
                    <svg viewBox="0 0 512 512" fill="currentColor">
                      <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2l144 0c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48l-97.5 0c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3l0-38.3 0-48 0-24.9c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192l64 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32L0 224c0-17.7 14.3-32 32-32z"/>
                    </svg>
                    <span>{slide.helpful}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button className="gr-arrow gr-arrow--right" onClick={next} disabled={current === slides.length - 1} aria-label="Next">
            <svg viewBox="0 0 320 512"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
          </button>
        </div>

        {/* Dots */}
        <div className="gr-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`gr-dot ${i === current ? 'gr-dot--active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};