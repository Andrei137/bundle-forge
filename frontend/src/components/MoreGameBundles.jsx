import { useState } from 'react';
import './MoreGameBundles.css';

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const GogIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4a6 6 0 0 1 6 6 6 6 0 0 1-6 6 6 6 0 0 1-6-6 6 6 0 0 1 6-6zm0 2a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z" />
  </svg>
);

const ViewIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor">
    <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zm395.3 11.3l-112 112c-4.6 4.6-11.5 5.9-17.4 3.5s-9.9-8.3-9.9-14.8l0-64-96 0c-17.7 0-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32l96 0 0-64c0-6.5 3.9-12.3 9.9-14.8s12.9-1.1 17.4 3.5l112 112c6.2 6.2 6.2 16.4 0 22.6z" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" width="13" height="13">
    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z" />
  </svg>
);

// TODO: [MOCK] Sample bundle data derived from the HTML structure
const BUNDLES = [
  {
    id: 1,
    title: 'Build your own Exodus Bundle (Spring 2026)',
    slug: 'build-your-own-exodus-bundle',
    image: 'https://fanatical.imgix.net/product/original/125cf666-d1a7-463c-b233-72308b902adc.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 31,
    drm: 'steam',
  },
  {
    id: 2,
    title: 'Build your own Titanium Collection (April 2026)',
    slug: 'build-your-own-titanium-collection',
    image: 'https://fanatical.imgix.net/product/original/6ff252a3-a628-428a-a7fd-602a78505002.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 24,
    drm: 'steam',
  },
  {
    id: 3,
    title: 'Whale and Dolphin Conservation Charity Bundle',
    slug: 'whale-and-dolphin-conservation-charity-bundle',
    image: 'https://fanatical.imgix.net/product/original/e3ff8f21-e759-4ad9-a291-042607ba6aa8.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 10,
    drm: 'steam',
  },
  {
    id: 4,
    title: 'Build your own Killer Bundle (BundleFest 2026)',
    slug: 'build-your-own-killer-bundle',
    image: 'https://fanatical.imgix.net/product/original/88296cba-29aa-409f-b099-74bea05d9a64.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 4,
    drm: 'steam',
  },
  {
    id: 5,
    title: 'Platinum Collection - Build your own Bundle (April 2026)',
    slug: 'platinum-collection-build-your-own-bundle',
    image: 'https://fanatical.imgix.net/product/original/b43142b4-3bf7-42bd-8e84-572e5934ae21.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 11,
    drm: 'steam',
  },
  {
    id: 6,
    title: 'Build your own Wholesome Collection',
    slug: 'build-your-own-wholesome-collection',
    image: 'https://fanatical.imgix.net/product/original/72de682b-6e49-47dc-a817-c640eb9f2b2c.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 15,
    drm: 'steam',
  },
  {
    id: 7,
    title: 'Build your own Bethesda Bundle - GOG Edition (Spring 2026)',
    slug: 'build-your-own-bethesda-bundle-gog-edition',
    image: 'https://fanatical.imgix.net/product/original/ab35a3a8-1c7a-48c0-8c90-911d31f59e97.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 16,
    drm: 'gog',
  },
  {
    id: 8,
    title: 'Build your own Very Positive Bundle (March 2026)',
    slug: 'build-your-own-very-positive-bundle',
    image: 'https://fanatical.imgix.net/product/original/33db5f94-8807-400f-b448-64bc3460fb3b.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 4,
    drm: 'steam',
  },
  {
    id: 9,
    title: 'Build your own Cute and Cozy Bundle',
    slug: 'build-your-own-cute-and-cozy-bundle',
    image: 'https://fanatical.imgix.net/product/original/1b1958f5-390e-4ff7-8209-103f2d0f475c.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 7,
    drm: 'steam',
  },
  {
    id: 10,
    title: 'Build your own Play on the Go Bundle - March 2026',
    slug: 'build-your-own-play-on-the-go-bundle-march-2026',
    image: 'https://fanatical.imgix.net/product/original/dda99bd7-ccfd-4e2f-b91e-979f9ed77a5f.jpeg?auto=compress,format&w=420&fit=crop&h=236',
    daysLeft: 1,
    drm: 'steam',
  },
];

const CARDS_PER_SLIDE = 3;

export const MoreGameBundles = ({ bundles = BUNDLES }) => {
  const [slide, setSlide] = useState(0);

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
          <a href="/en/bundle" className="mgb-view-all-btn">VIEW ALL</a>
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
              <div key={bundle.id} className="mgb-card">
                <a href={`/en/pick-and-mix/${bundle.slug}`} className="mgb-card-link" aria-label={bundle.title}>
                  <div className="mgb-card-img-wrap">
                    <img
                      src={bundle.image}
                      alt={bundle.title}
                      className="mgb-card-img"
                      loading="lazy"
                    />
                    <div className="mgb-card-overlay">
                      <button className="mgb-view-btn">
                        <ViewIcon />
                        VIEW
                      </button>
                      <span className="mgb-quick-look">
                        <EyeIcon />
                        Quick Look
                      </span>
                    </div>
                  </div>
                </a>

                <div className="mgb-card-footer">
                  <div className="mgb-card-drm">
                    {bundle.drm === 'steam' ? <SteamIcon /> : <GogIcon />}
                    <span className="mgb-card-drm-label">
                      {bundle.drm === 'steam' ? 'STEAM' : 'GOG'}
                    </span>
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

      </div>
    </section>
  );
};
