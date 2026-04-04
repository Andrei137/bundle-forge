import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { openCart } from '../redux/slices/uiSlice';
import './HeroSection.css';

export const HeroSection = () => {
  const dispatch = useDispatch();

  const featured = {
    id: 3,
    title: "Baldur's Gate 3",
    subtitle: "The Ultimate D&D Experience",
    description: "Create the character you want, gather your party, and embark on an epic adventure written for you.",
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    cta: "Shop Now"
  };

  const handleAddToCart = () => {
    dispatch(addToCart(featured));
    dispatch(openCart());
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <img src={featured.image} alt={featured.title} className="hero-image" />
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <span className="hero-label">FEATURED</span>
          <h1 className="hero-title">{featured.title}</h1>
          <h2 className="hero-subtitle">{featured.subtitle}</h2>
          <p className="hero-description">{featured.description}</p>

          <div className="hero-pricing">
            {featured.discount > 0 && (
              <span className="discount-badge">-{featured.discount}%</span>
            )}
            <div className="price-info">
              <span className="current-price">${featured.price}</span>
              {featured.discount > 0 && (
                <span className="original-price">${featured.originalPrice}</span>
              )}
            </div>
          </div>

          <button className="hero-cta" onClick={handleAddToCart}>
            {featured.cta}
          </button>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value">⭐ 4.9</div>
            <div className="stat-label">Rating</div>
          </div>
          <div className="stat">
            <div className="stat-value">🎮 3.2K</div>
            <div className="stat-label">Reviews</div>
          </div>
          <div className="stat">
            <div className="stat-value">🏆 Award</div>
            <div className="stat-label">Winner</div>
          </div>
        </div>
      </div>
    </section>
  );
};
