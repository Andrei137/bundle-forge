import { useState, useEffect } from 'react';
import { bundles } from '../data/games';
import './GameBundlesSlider.css';

export const GameBundlesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Each slide shows exactly 3 bundles
  const bundlesPerSlide = 3;

  // Create enough slides with 3 bundles each
  const bundlesArray = [...bundles, ...bundles]; // Duplicate for more content
  const slideCount = Math.ceil(bundlesArray.length / bundlesPerSlide);

  const slides = [];
  for (let i = 0; i < slideCount; i++) {
    const startIdx = i * bundlesPerSlide;
    slides.push(bundlesArray.slice(startIdx, startIdx + bundlesPerSlide));
  }

  // Total slides including the "View All" slide at the end
  const totalSlides = slides.length + 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-advance slides
  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section className="game-bundles-slider">
      <div className="game-bundles-container">
        <div className="slider-header">
          <h2 className="slider-title">More Game Bundles</h2>
          <a href="#" className="view-all-btn">VIEW ALL</a>
        </div>

        <div className="site-slider">
          {/* Left Arrow */}
          <button
            className="SiteSlider__arrow SiteSlider__arrow--left"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>

          {/* Slides */}
          <div className="SiteSlider__viewport">
            <div
              className="SiteSlider__track"
              style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
            >
              {slides.map((slideBundles, slideIndex) => (
                <div key={slideIndex} className="SiteSlider__slide">
                  <div className="bundles-row">
                    {slideBundles.map((bundle, bundleIndex) => (
                      <div key={bundle.id + '-' + slideIndex + '-' + bundleIndex} className="bundle-card-slider">
                        <div className="bundle-card-image">
                          <img src={bundle.image} alt={bundle.title} />
                        </div>
                        <div className="bundle-card-footer">
                          <div className="bundle-platform">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            <span>STEAM</span>
                          </div>
                          <div className="bundle-days-left">
                            {12 + (slideIndex * 3 + bundleIndex) * 10} DAYS LEFT
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* View All Slide - Last slide */}
              <div className="SiteSlider__slide">
                <div className="bundles-row">
                  <div className="view-all-card">
                    <div className="view-all-content">
                      <span>View All More Game Bundles</span>
                      <div className="view-all-dots">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            className="SiteSlider__arrow SiteSlider__arrow--right"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M8.59 16.59L10 17.41l6-6-6-6-1.41 1.41L13.17 12z"/>
            </svg>
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="SiteSlider__dots">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`SiteSlider__dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
