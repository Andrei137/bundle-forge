import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { closeGameDetails, openCart } from '../redux/slices/uiSlice';
import './GameDetailsModal.css';

export const GameDetailsModal = () => {
  const dispatch = useDispatch();
  const { gameDetailsModalOpen, selectedGameForDetails } = useSelector(
    state => state.ui
  );
  const game = selectedGameForDetails;

  if (!gameDetailsModalOpen || !game) return null;

  const handleAddToCart = () => {
    dispatch(addToCart(game));
    dispatch(openCart());
    dispatch(closeGameDetails());
  };

  const handleClose = () => {
    dispatch(closeGameDetails());
  };

  return (
    <>
      <div className="modal-backdrop" onClick={handleClose} />

      <div className="game-details-modal">
        <button className="modal-close" onClick={handleClose}>
          ✕
        </button>

        <div className="modal-content">
          <div className="modal-image">
            <img src={game.image} alt={game.title} />
            {game.discount > 0 && (
              <div className="modal-discount">-{game.discount}%</div>
            )}
          </div>

          <div className="modal-info">
            <span className="game-category">{game.category}</span>
            <h1>{game.title}</h1>

            <div className="rating-section">
              <div className="rating">
                <span className="stars">⭐ {game.rating}</span>
                <span className="review-count">{game.reviews} reviews</span>
              </div>
            </div>

            <p className="description">{game.description}</p>

            <div className="game-details">
              <div className="detail-item">
                <span className="detail-label">Release Date</span>
                <span className="detail-value">
                  {new Date(game.releaseDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Platforms</span>
                <span className="detail-value">
                  {game.platforms.join(', ')}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Genre</span>
                <span className="detail-value">
                  {game.tags.join(', ')}
                </span>
              </div>
            </div>

            <div className="pricing-section">
              <div className="price-block">
                {game.discount > 0 && (
                  <div className="savings-info">
                    Save RON {(game.originalPrice - game.price).toFixed(2)}
                  </div>
                )}
                <div className="price-display">
                  <span className="current-price">
                    RON {game.price}
                  </span>
                  {game.discount > 0 && (
                    <span className="original-price">
                      Was RON {game.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
              <button
                className="close-modal-btn"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
