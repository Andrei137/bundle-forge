import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import youtubeIcon from '../assets/icons/youtube-icon-white.svg';
import './Game.css';

const API_URL = import.meta.env.VITE_API_URL;

const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#f90' : 'none'} stroke="#f90" strokeWidth="1.5" width="16" height="16">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" width="18" height="18">
    <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? '#f90' : 'none'} stroke={filled ? '#f90' : 'currentColor'} strokeWidth="2" width="18" height="18">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
    <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.6)"/>
    <polygon points="10 8 16 12 10 16 10 8" fill="#fff"/>
  </svg>
);

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="14" height="14">
    <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"/>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="14" height="14">
    <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
  </svg>
);

const MetacriticIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <circle cx="12" cy="12" r="11" fill="#66cc33" stroke="#4aa528" strokeWidth="1"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">M</text>
  </svg>
);

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
            <img
              src={image}
              alt={title}
              className="SliderVideo__img"
              loading="eager"
            />

            <div className="slide-video-button-container">
              <button
                className="SliderVideo__button"
                onClick={() => setIsPlaying(true)}
                aria-label="Play trailer"
              >
                <img
                  width={80}
                  src={youtubeIcon}
                  alt="YouTube-play-button"
                />
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

const fetchGame = async (gameId) => {
  const response = await fetch(`${API_URL}/games/${gameId}`);
  if (!response.ok) throw new Error('Failed to fetch game');
  const data = await response.json();

  return {
    title: data.title,
    rating: 4.6,
    userRatings: 1,
    metacritic: 88,
    steamRating: { score: 97, label: 'Overwhelmingly Positive' },
    recommendPercent: 100,
    tags: ['Action', 'Third-Person Shooter', 'Adventure', 'Action-Adventure'],
    description: "Capcom's newest IP—PRAGMATA. An all-new Science Fiction action adventure with its own unique hacking twist!",
    drm: 'steam',
    platforms: ['windows'],
    activatesIn: 'Romania',
    editions: [
      { id: 'standard',       label: 'Standard',       price: 250.72, originalPrice: 305.89, discount: 18 },
      { id: 'digital-deluxe', label: 'Digital Deluxe',  price: 292.53, originalPrice: 356.88, discount: 18 },
    ],
    media: [
      { type: 'youtube', thumb: 'https://fanatical.imgix.net/product/original/9f0d852b-5735-4dcf-a4ee-5ddfa549fbd7.jpeg', youtubeId: 'TzBtbtOghV0' },
      { type: 'youtube', thumb: `https://img.youtube.com/vi/0dlHZUm0iU4/maxresdefault.jpg`, youtubeId: '0dlHZUm0iU4' },
      { type: 'image', thumb: 'https://fanatical.imgix.net/product/original/6ff252a3-a628-428a-a7fd-602a78505002.jpeg?auto=compress,format&w=200&fit=crop&h=112' },
      { type: 'image', thumb: 'https://fanatical.imgix.net/product/original/e3ff8f21-e759-4ad9-a291-042607ba6aa8.jpeg?auto=compress,format&w=200&fit=crop&h=112' },
      { type: 'image', thumb: 'https://fanatical.imgix.net/product/original/b43142b4-3bf7-42bd-8e84-572e5934ae21.jpeg?auto=compress,format&w=200&fit=crop&h=112' },
    ],
    mainImage: 'https://fanatical.imgix.net/product/original/88296cba-29aa-409f-b099-74bea05d9a64.jpeg?auto=compress,format&w=840&fit=crop&h=473',
    specialOffers: [
      {
        id: 1,
        image: 'https://fanatical.imgix.net/product/original/125cf666-d1a7-463c-b233-72308b902adc.jpeg?auto=compress,format&w=600&fit=crop&h=300',
        title: 'Purchase Early to Receive',
        subtitle: 'IN GAME OUTFITS!',
        subtitleColor: '#f90',
      },
      {
        id: 2,
        image: 'https://fanatical.imgix.net/product/original/e3ff8f21-e759-4ad9-a291-042607ba6aa8.jpeg?auto=compress,format&w=600&fit=crop&h=300',
        title: 'Shop the Level Up Sale',
        subtitle: 'WIN UP TO £1500!',
        subtitleColor: '#f90',
      },
    ],
    about: {
      description: `PRAGMATA is an all-new Science Fiction action-adventure from Capcom. Set in a near-future version of New York, you play as a soldier who discovers a mysterious girl with unbelievable hacking abilities. Together you'll traverse a world transformed by technology, uncovering a vast and shocking conspiracy.

  Seamlessly switch between intense gunplay and hacking to solve puzzles, bypass security, and overcome enemies. Your companion's extraordinary abilities open up entirely new ways to interact with the environment.`,
      details: {
        Platform: 'PC',
        Genre: 'Action, Adventure',
        Publisher: 'Capcom',
        Developer: 'Capcom',
        'Release Date': 'TBA 2024',
        Languages: 'English, Japanese, French, German, Spanish',
      },
    },
  };
};

export const Game = () => {
  const dispatch = useDispatch();
  const { id: gameId } = useParams();
  const [selectedEdition, setSelectedEdition] = useState('standard');
  const [wishlist, setWishlist] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeTab, setActiveTab] = useState('about');
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => fetchGame(gameId),
    enabled: !!gameId,
  });

  if (isLoading) {
    return <div className="gp-page"><div className="gp-container"><p>Loading...</p></div></div>;
  }

  if (error || !game) {
    return <div className="gp-page"><div className="gp-container"><p>Error: {error?.message ?? 'Game not found'}</p></div></div>;
  }

  const edition = game.editions.find(e => e.id === selectedEdition);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: `${game.title}-${selectedEdition}`,
      title: `${game.title} (${edition.label})`,
      price: edition.price,
      originalPrice: edition.originalPrice,
      discount: edition.discount,
      image: game.mainImage,
      quantity: 1,
    }));
  };

  return (
    <div className="gp-page">
      <div className="gp-container">

        <div className="gp-title-row">
          <h1 className="gp-title">{game.title}</h1>
        </div>

        <div className="gp-rating-bar">
          <StarRating rating={game.rating} />
          <span className="gp-rating-val">{game.rating}</span>
          <span className="gp-rating-count">{game.userRatings} User Rating</span>

          <div className="gp-rating-sep" />

          <div className="gp-metacritic">
            <span className="gp-metacritic-badge">{game.metacritic}</span>
            <MetacriticIcon />
            <span className="gp-metacritic-label">metacritic</span>
          </div>

          <div className="gp-rating-sep" />

          <div className="gp-steam-rating">
            <SteamIcon />
            <span className="gp-steam-score">STEAM {game.steamRating.score}%</span>
            <span className="gp-steam-label">| {game.steamRating.label}</span>
          </div>

          <div className="gp-rating-sep" />

          <div className="gp-thumbs">
            <ThumbsUpIcon />
            <span>{game.recommendPercent}% of users recommend this</span>
          </div>
        </div>

        <div className="gp-content-grid">

          <div className="gp-media-col">

            <div className="gp-main-viewer">
              {game.media[activeThumb]?.type === 'youtube' ? (
                <SliderVideo
                  image={game.media[activeThumb].thumb || game.media[activeThumb].mainImage}
                  youtubeId={game.media[activeThumb].youtubeId}
                  title="PRAGMATA - Main Trailer"
                />
              ) : (
                <>
                  <img
                    src={
                      game.media[activeThumb]?.thumb
                        ?.replace('w=200', 'w=840')
                        .replace('h=112', 'h=473') || game.mainImage
                    }
                    alt={game.title}
                    className="gp-main-img"
                  />
                </>
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
                  {m.type === 'youtube' && <span className="gp-thumb-play">
                      <img
                        src={youtubeIcon}
                        alt="YouTube-play-button"
                      />
                    </span>
                  }
                </button>
              ))}
            </div>

          </div>

          <div className="gp-sidebar">

            <div className="gp-sidebar-top">
              <div className="gp-drm-row">
                <SteamIcon />
                <span className="gp-drm-label">STEAM</span>
                <WindowsIcon />
              </div>
              <button
                className={`gp-wishlist-btn ${wishlist ? 'gp-wishlist-btn--active' : ''}`}
                onClick={() => setWishlist(v => !v)}
                aria-label="Add to wishlist"
              >
                <HeartIcon filled={wishlist} />
              </button>
            </div>

            <div className="gp-tags">
              {game.tags.map(tag => (
                <span key={tag} className="gp-tag">{tag}</span>
              ))}
            </div>

            <p className="gp-description">{game.description}</p>

            <div className="gp-editions">
              {game.editions.map(ed => (
                <button
                  key={ed.id}
                  className={`gp-edition-btn ${selectedEdition === ed.id ? 'gp-edition-btn--active' : ''}`}
                  onClick={() => setSelectedEdition(ed.id)}
                >
                  <span className="gp-edition-label">{ed.label}</span>
                  <span className="gp-edition-price">
                    <span className="gp-edition-now">RON {ed.price.toFixed(2)}</span>
                    <span className="gp-edition-was">RON {ed.originalPrice.toFixed(2)}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="gp-price-row">
              <span className="gp-price-now">RON {edition.price.toFixed(2)}</span>
              <span className="gp-price-was">RON {edition.originalPrice.toFixed(2)}</span>
              <span className="gp-price-discount">-{edition.discount}%</span>
            </div>

            <button className="gp-cart-btn" onClick={handleAddToCart}>
              <CartIcon /> Add To Cart
            </button>

          </div>
        </div>

        <div className="gp-about-section">
          <div className="gp-about-header">
            <h2 className="gp-section-title">About {game.title}</h2>
            <div className="gp-about-tabs">
              <button className={`gp-about-tab ${activeTab === 'about' ? 'gp-about-tab--active' : ''}`}
                onClick={() => setActiveTab('about')}>About</button>
              <button className={`gp-about-tab ${activeTab === 'requirements' ? 'gp-about-tab--active' : ''}`}
                onClick={() => setActiveTab('requirements')}>Requirements</button>
            </div>
          </div>

          <div className="gp-about-grid">
            <div className="gp-about-content">
              <h3 className="gp-about-sub">About this game</h3>
              {game.about.description.split('\n\n').map((para, i) => (
                <p key={i} className="gp-about-para">{para}</p>
              ))}
            </div>

            <div className="gp-game-details">
              <h3 className="gp-about-sub">Game Details</h3>
              <div className="gp-details-list">
                {Object.entries(game.about.details).map(([key, val]) => (
                  <div key={key} className="gp-detail-row">
                    <span className="gp-detail-key">{key}:</span>
                    <span className="gp-detail-val">{val}</span>
                  </div>
                ))}
              </div>
              <div className="gp-detail-tags">
                <span className="gp-drm-tag"><SteamIcon /> STEAM</span>
                <span className="gp-platform-tag"><WindowsIcon /></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};