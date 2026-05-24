import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import CartIcon from '../assets/icons/cart.svg?react';
import youtubeIcon from '../assets/icons/youtube-icon-white.svg';
import WindowsIcon from '../assets/icons/windows.svg?react';
import AppleIcon from '../assets/icons/apple.svg?react';
import LinuxIcon from '../assets/icons/linux.svg?react';
import SteamIcon from '../assets/icons/steam.svg?react';
import './Game.css';

const API_URL = import.meta.env.VITE_API_URL;

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#f90' : 'none'} stroke="#f90" strokeWidth="1.5" width="16" height="16">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="14" height="14">
    <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ color: '#4caf50' }}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

// All 3 slots always render — missing ones are invisible placeholders that preserve equal width
const ALL_PLATFORM_SLOTS = [
  { id: 'Windows', label: 'Windows', icon: <WindowsIcon className="os-icon" /> },
  { id: 'Linux',   label: 'Linux',   icon: <LinuxIcon className="os-icon" /> },
  { id: 'macOS',   label: 'macOS',   icon: <AppleIcon className="os-icon" /> },
];

export default function SliderVideo({ image, youtubeId, title }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
  }, [youtubeId]);

  return (
    <div className="SliderVideo">
      {!isPlaying ? (
        <>
          <div className="SliderVideo__slide">
            <img src={image} alt={title} className="SliderVideo__img" loading="eager" />
            <div className="slide-video-button-container">
              <button className="SliderVideo__button" onClick={() => setIsPlaying(true)} aria-label="Play trailer">
                <img width={80} src={youtubeIcon} alt="YouTube-play-button" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="videoWrapper">
          <iframe
            className="youtube-video"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

const StarRating = ({ rating, max = 5 }) => (
  <div className="gp-stars">
    {Array.from({ length: max }, (_, i) => (
      <StarIcon key={i} filled={i < Math.round(rating)} />
    ))}
  </div>
);

const TagsDisplay = ({ genres }) => {
  const containerRef = useRef(null);
  const [visibleTags, setVisibleTags] = useState([]);

  useEffect(() => {
    if (!containerRef.current || !genres || genres.length === 0) {
      setVisibleTags([]);
      return;
    }

    const container = containerRef.current;
    const maxLines = 2;
    const maxHeight = maxLines * 1.5 * 16; // approximate line height in pixels

    let fitted = [];
    for (let i = 0; i < genres.length; i++) {
      fitted.push(genres[i]);
      const testTags = fitted.map(tag => (
        <span key={tag.id} className="gp-tag">{tag.name}</span>
      ));

      const testDiv = document.createElement('div');
      testDiv.className = 'gp-tags';
      testDiv.style.position = 'absolute';
      testDiv.style.visibility = 'hidden';
      testDiv.style.width = container.offsetWidth + 'px';

      const tempContainer = document.createElement('div');
      testTags.forEach(tag => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'gp-tag';
        tagSpan.textContent = genres[i].name;
        tempContainer.appendChild(tagSpan);
      });

      if (tempContainer.offsetHeight > maxHeight) {
        fitted.pop();
        break;
      }
    }

    setVisibleTags(fitted);
  }, [genres]);

  return (
    <div className="gp-tags" ref={containerRef}>
      {visibleTags.map(tag => (
        <span key={tag.id} className="gp-tag">{tag.name}</span>
      ))}
    </div>
  );
};

function AboutTab({ game }) {
  const [expanded, setExpanded] = useState(false);

  const CHAR_LIMIT = 800;
  const fullText = game.about.description;
  const isLong = fullText.length > CHAR_LIMIT;
  const displayText = expanded || !isLong ? fullText : fullText.slice(0, CHAR_LIMIT) + '…';

  const col1Details = {
    Platform:       game.about.details.Platform,
    'Release Date': game.about.details['Release Date'],
    Developer:      game.about.details.Developer,
    Link:           game.about.details.Link ?? null,
  };

  return (
    <div className="gp-about-grid-new">
      <div className="gp-about-content-new">
        <h3 className="gp-about-sub">About this game</h3>
        <div className="gp-about-text">
          {displayText.split('\n\n').map((para, i) => (
            <p key={i} className="gp-about-para">{para.trim()}</p>
          ))}
        </div>
        {isLong && (
          <button className="gp-show-more-btn" onClick={() => setExpanded(v => !v)}>
            {expanded ? 'Show less ▲' : 'Show more ▼'}
          </button>
        )}
      </div>

      <div className="gp-game-details-new">
        <h3 className="gp-about-sub">Game Details</h3>

        <div className="gp-details-two-col">
          <div className="gp-details-sub-col">
            {Object.entries(col1Details).map(([key, val]) => {
              if (!val) return null;
              if (key === 'Link') return (
                <div key={key} className="gp-detail-row-new">
                  <span className="gp-detail-key-new">{key}:</span>
                  <a href={val} className="gp-detail-link" target="_blank" rel="noreferrer">
                    View the website <ExternalLinkIcon />
                  </a>
                </div>
              );
              return (
                <div key={key} className="gp-detail-row-new">
                  <span className="gp-detail-key-new">{key}:</span>
                  <span className="gp-detail-val-new">{val}</span>
                </div>
              );
            })}

            <div className="gp-detail-row-new">
              <span className="gp-detail-key-new">Languages:</span>
              <span className="gp-detail-val-new">
                {game.about.details.Languages ?? 'English'}
              </span>
            </div>
          </div>

          <div className="gp-details-sub-col">
            <div className="gp-tag-group">
              <span className="gp-tag-group-label">Tags:</span>
              <div className="gp-tag-links">
                {game.tags && game.tags.length > 0 ? (
                  game.tags.map(t => <a key={t.id} href="#" className="gp-tag-link">{t.name}</a>)
                ) : (
                  <span style={{ color: '#999', fontSize: '0.9em' }}>Not defined</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequirementsTab({ game }) {
  const firstAvailable = ALL_PLATFORM_SLOTS.find(p => Object.hasOwn(game.systemRequirements, p.id))?.id ?? 'windows';
  const [platform, setPlatform] = useState(firstAvailable);
  const reqs = game.systemRequirements[platform];

  const available = ALL_PLATFORM_SLOTS.filter(({ id }) =>
    Object.hasOwn(game.systemRequirements, id)
  );

  const unavailable = ALL_PLATFORM_SLOTS.filter(({ id }) =>
    !Object.hasOwn(game.systemRequirements, id)
  );

  if (!reqs) {
    return (
      <div className="gp-req-section">
        <div className="gp-req-card">
          <h3 className="gp-about-sub">Product Requirements</h3>
          <p className="gp-req-note">No requirements available for this platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gp-req-section">
      <div className="gp-req-tab-bar">
        {available.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`gp-req-platform-tab ${
              platform === id ? 'gp-req-platform-tab--active' : ''
            }`}
            onClick={() => setPlatform(id)}
          >
            {icon} {label}
          </button>
        ))}

        {unavailable.map(({ id }) => (
          <div key={id} className="gp-req-tab-ghost" aria-hidden="true" />
        ))}
      </div>

      <div className="gp-req-card">
        <h3 className="gp-about-sub" style={{ marginBottom: '1.25rem' }}>Product Requirements</h3>
        <div className="gp-req-two-col">
          <div className="gp-req-col">
            <h4 className="gp-req-col-title">Minimum:</h4>
            <p className="gp-req-note">{reqs.minimum.note}</p>
            {Object.entries(reqs.minimum).filter(([k]) => k !== 'note').map(([key, val]) => (
              <div key={key} className="gp-req-row">
                <span className="gp-req-key">{key}:</span>
                <span className={`gp-req-val ${key === 'Additional Notes' ? 'gp-req-val--muted' : ''}`}>{val}</span>
              </div>
            ))}
          </div>

          <div className="gp-req-col">
            <h4 className="gp-req-col-title">Recommended:</h4>
            <p className="gp-req-note">{reqs.recommended.note}</p>
            {Object.entries(reqs.recommended).filter(([k]) => k !== 'note').map(([key, val]) => (
              <div key={key} className="gp-req-row">
                <span className="gp-req-key">{key}:</span>
                <span className={`gp-req-val ${key === 'Additional Notes' ? 'gp-req-val--muted' : ''}`}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const fetchGame = async (gameId) => {
  const response = await fetch(`${API_URL}/games/${gameId}`);
  if (!response.ok) throw new Error('Failed to fetch game');
  const data = await response.json();

  return {
    id: data.id,
    title: data.title,
    price: data.price,
    originalPrice: data.initialPrice,
    discount: data.discountPercentage,
    tags: data.tags ?? [],
    description: data.shortDescription,
    media: [
      ...(data.youtubeIds ?? []).map((id, index) => ({
        type: 'youtube',
        youtubeId: id,
        thumb:
          index === 0
            ? `${API_URL}${data.cover}`
            : `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      })),

      ...(data.images ?? []).map((img, index) => ({
        type: 'image',
        thumb: `${API_URL}${img}`,
      })),
    ],
    cover: data.cover,
    about: {
      description: data.longDescription,
      details: {
        Platform:       'Steam',
        'Release Date': data.releaseDate,
        Developer:      data.developer,
        Languages:      data.languages.join(', '),
        Link:           data.link,
      },
    },
    systemRequirements: data.systemRequirements,
  };
};

export const Game = () => {
  const dispatch = useDispatch();
  const { id: gameId } = useParams();
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeTab, setActiveTab] = useState('about');

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
    enabled: !!gameId,
  });

  if (isLoading) return <div className="gp-page"><div className="gp-container"><p>Loading...</p></div></div>;
  if (error || !game) return <div className="gp-page"><div className="gp-container"><p>Error: {error?.message ?? 'Game not found'}</p></div></div>;

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: game.id,
      title: game.title,
      price: game.price,
      originalPrice: game.originalPrice,
      discount: game.discount,
      image: `${API_URL}${game.cover}`,
      quantity: 1,
    }));
  };

  return (
    <div className="gp-page">
      <div className="gp-container">

        <div className="gp-title-row">
          <h1 className="gp-title">{game.title}</h1>
        </div>

        {/* <div className="gp-rating-bar">
          <StarRating rating={game.rating} />
          <span className="gp-rating-val">{game.rating}</span>
          <span className="gp-rating-count">{game.userRatings} User Rating</span>
          <div className="gp-rating-sep" />
          <div className="gp-metacritic">
            <span className="gp-metacritic-badge">{game.metacritic}</span>
            <MetacriticIcon width="30" height="30" />
            <span className="gp-metacritic-label">metacritic</span>
          </div>
          <div className="gp-rating-sep" />
          <div className="gp-steam-rating">
            <SteamIcon width="20" height="20" fill="#fff" />
            <span className="gp-steam-score">STEAM {game.steamRating.score}%</span>
            <span className="gp-steam-label">| {game.steamRating.label}</span>
          </div>
          <div className="gp-rating-sep" />
          <div className="gp-thumbs">
            <ThumbsUpIcon />
            <span>{game.recommendPercent}% of users recommend this</span>
          </div>
        </div> */}

        <div className="gp-content-grid">
          <div className="gp-media-col">
            <div className="gp-main-viewer">
              {game.media[activeThumb]?.type === 'youtube' ? (
                <SliderVideo
                  image={game.media[activeThumb].thumb || game.media[activeThumb].cover}
                  youtubeId={game.media[activeThumb].youtubeId}
                  title="PRAGMATA - Main Trailer"
                />
              ) : (
                <img
                  src={game.media[activeThumb]?.thumb?.replace('w=200', 'w=840').replace('h=112', 'h=473') || game.cover}
                  alt={game.title}
                  className="gp-main-img"
                />
              )}
            </div>

            <div className="gp-thumbs-strip">
              {game.media.map((m, i) => (
                <button
                  key={i}
                  className={`gp-thumb ${i === activeThumb ? 'gp-thumb--active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                >
                  <img src={m.thumb} alt={`Screenshot ${i + 1}`} />
                  {m.type === 'youtube' && (
                    <span className="gp-thumb-play">
                      <img src={youtubeIcon} alt="YouTube-play-button" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="gp-sidebar">
            <div className="gp-sidebar-top">
              <div className="gp-drm-row">
                <SteamIcon width="20" height="20" fill="#fff" />
                <span className="gp-drm-label">STEAM</span>
                  {ALL_PLATFORM_SLOTS.map(({ id, icon, label }) =>
                    Object.hasOwn(game.systemRequirements, id) ? (
                      <div key={id} className="gp-platform-icon" title={label}>
                        {icon}
                      </div>
                    ) : null
                  )}
              </div>
            </div>

            <TagsDisplay genres={game.tags} />

            <p className="gp-description">{game.description}</p>

            {game.discount ? (
              <div className="gp-price-row">
                <span className="gp-price-now">RON {game.price.toFixed(2)}</span>
                {game.originalPrice && <span className="gp-price-was">RON {game.originalPrice.toFixed(2)}</span>}
                <span className="gp-price-discount" style={{ fontSize: '1.1em', fontWeight: 'bold' }}>-{game.discount}%</span>
              </div>
            ) : (
              <div className="gp-price-row">
                <span className="gp-price-now">RON {game.price.toFixed(2)}</span>
              </div>
            )}

            <button className="gp-cart-btn" onClick={handleAddToCart}>
              <CartIcon /> Add To Cart
            </button>
          </div>
        </div>

        <div className="gp-about-section">
          <div className="gp-about-header">
            <h2 className="gp-section-title">About {game.title}</h2>
            <div className="gp-about-tabs">
              <button
                className={`gp-about-tab ${activeTab === 'about' ? 'gp-about-tab--active' : ''}`}
                onClick={() => setActiveTab('about')}
              >About</button>
              <button
                className={`gp-about-tab ${activeTab === 'requirements' ? 'gp-about-tab--active' : ''}`}
                onClick={() => setActiveTab('requirements')}
              >Requirements</button>
            </div>
          </div>

          {activeTab === 'about' ? (
            <AboutTab game={game} />
          ) : (
            <RequirementsTab game={game} />
          )}
        </div>

      </div>
    </div>
  );
};
