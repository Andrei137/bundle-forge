import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { openCart } from '../redux/slices/uiSlice';
import { bundles } from '../data/games';
import './BundlesSection.css';

export const BundlesSection = () => {
  const dispatch = useDispatch();
  const games = useSelector(state => state.games.all);

  const handleAddBundleToCart = (bundle) => {
    bundle.games.forEach(gameId => {
      const game = games.find(g => g.id === gameId);
      if (game) {
        dispatch(addToCart(game));
      }
    });
    dispatch(openCart());
  };

  return (
    <section className="bundles-section">
      <div className="bundles-container">
        <h2>Featured Bundles</h2>
        <p className="bundles-subtitle">Incredible savings on curated game collections</p>

        <div className="bundles-grid">
          {bundles.map(bundle => (
            <div key={bundle.id} className="bundle-card">
              <div className="bundle-image">
                <img src={bundle.image} alt={bundle.title} />
                {bundle.discount > 0 && (
                  <div className="bundle-discount">-{bundle.discount}%</div>
                )}
                <div className="bundle-overlay">
                  <button
                    className="bundle-add-btn"
                    onClick={() => handleAddBundleToCart(bundle)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              <div className="bundle-content">
                <h3>{bundle.title}</h3>
                <p className="bundle-description">{bundle.description}</p>

                <div className="bundle-games-count">
                  📦 {bundle.games.length} games included
                </div>

                <div className="bundle-pricing">
                  <div className="discount-badge">-{bundle.discount}%</div>
                  <div className="price-info">
                    <span className="current-price">${bundle.price}</span>
                    <span className="original-price">
                      Was RON {bundle.originalPrice}
                    </span>
                  </div>
                </div>

                <div className="bundle-savings">
                  Save RON {(bundle.originalPrice - bundle.price).toFixed(2)}
                </div>

                <button
                  className="bundle-btn"
                  onClick={() => handleAddBundleToCart(bundle)}
                >
                  Get Bundle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
