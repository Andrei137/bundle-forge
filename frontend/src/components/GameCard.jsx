import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { openGameDetails } from '../redux/slices/uiSlice';
import './GameCard.css';

export const GameCard = ({ game }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(game));
  };

  const handleViewDetails = () => {
    dispatch(openGameDetails(game));
  };

  return (
    <div className="game-card" onClick={handleViewDetails}>
      <div className="game-card-image">
        <img src={game.image} alt={game.title} />
        {game.discount > 0 && (
          <div className="game-card-discount">-{game.discount}%</div>
        )}
        <div className="game-card-overlay">
          <button
            className="game-card-add-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="game-card-content">
        <h3 className="game-card-title">{game.title}</h3>
        <p className="game-card-category">{game.category}</p>

        <div className="game-card-rating">
          <span className="rating-stars">⭐ {game.rating}</span>
          <span className="rating-count">({game.reviews})</span>
        </div>

        <div className="game-card-tags">
          {game.tags.slice(0, 2).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <div className="game-card-pricing">
          <div className="price-section">
            <span className="current-price">${game.price}</span>
            {game.discount > 0 && (
              <span className="original-price">${game.originalPrice}</span>
            )}
          </div>
          <div className="savings">
            Save ${(game.originalPrice - game.price).toFixed(2)}
          </div>
        </div>

        <button
          className="game-card-btn"
          onClick={handleAddToCart}
        >
          + Cart
        </button>
      </div>
    </div>
  );
};
