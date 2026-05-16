import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartIcon from '../assets/icons/cart.svg?react';
import ViewIcon from '../assets/icons/view.svg?react';
import SteamIcon from '../assets/icons/steam.svg?react';
import WindowsIcon from '../assets/icons/windows.svg?react';
import AppleIcon from '../assets/icons/apple.svg?react';
import LinuxIcon from '../assets/icons/linux.svg?react';
import { addToCart } from '../redux/slices/cartSlice';
import './TopSellers.css';

const API_URL = import.meta.env.VITE_API_URL;

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

const FILTERS = ['All Products', 'Games', 'Bundles'];
const FILTER_MAP = { 'All Products': 'ALL', 'Games': 'GAMES', 'Bundles': 'BUNDLES' };

const effectivePrice = (item) => {
  if (!item.price) return null;
  if (item.discountPercentage > 0) return item.price * (1 - item.discountPercentage / 100);
  return item.price;
};

export const TopSellers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Products');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const filter = FILTER_MAP[activeFilter];
    fetch(`${API_URL}/top-sellers?filter=${filter}`)
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeFilter]);

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

  return (
    <section className="ts-section">
      <div className="ts-container">
        <h2 className="ts-heading">Top Sellers</h2>

        <div className="ts-filter-tabs">
          {FILTERS.map(filter => (
            <button
              key={filter}
              className={`ts-filter-tab ${activeFilter === filter ? 'ts-filter-tab--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
          <a href="/search" className="ts-view-all-link">VIEW ALL</a>
        </div>

        <div className="ts-grid">
          {items.length === 0 ? (
            <div className="ts-empty">No products available right now.</div>
          ) : items.map((item) => {
            const ep = effectivePrice(item);
            return (
              <div
                key={`${item.type}-${item.id}`}
                className="ts-card"
                onClick={() => handleClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ts-card-img-wrap">
                  <img
                    src={`${API_URL}${item.cover}`}
                    alt={item.title}
                    className="ts-card-img"
                  />
                  {item.discountPercentage > 0 && (
                    <span className="ts-deal-badge">-{item.discountPercentage}%</span>
                  )}
                </div>
                <div className="ts-card-bar">
                  <div className="ts-card-title">{item.title}</div>
                  <div className="ts-card-bottom">
                    <div className="ts-card-icons">
                      <SteamIcon width="14" height="14" />
                      {item.type === 'GAME'
                        ? <PlatformIcons platforms={item.platforms} />
                        : <span className="ts-card-type-label">BUNDLE</span>
                      }
                    </div>
                    <div className="ts-card-right">
                      {item.type !== 'BUNDLE' && ep != null && (
                        <div className="ts-card-prices">
                          {item.discountPercentage > 0 && (
                            <span className="ts-card-was">RON {item.price.toFixed(2)}</span>
                          )}
                          <span className="ts-card-now">RON {ep.toFixed(2)}</span>
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
    </section>
  );
};
