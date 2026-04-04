import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { openCart } from '../redux/slices/uiSlice';
import './FeaturedDeals.css';

export const FeaturedDeals = () => {
  const dispatch = useDispatch();
  const games = useSelector(state => state.games.all);
  const [activeIndex, setActiveIndex] = useState(0);

  // Get top 5 games as featured deals
  const featuredGames = games.slice(0, 5);
  const mainFeatured = featuredGames[activeIndex];
  const supportingGames = featuredGames.filter((_, i) => i !== activeIndex).slice(0, 4);

  const handleAddToCart = (game) => {
    dispatch(addToCart(game));
    dispatch(openCart());
  };

  const handleSupportCardClick = (index) => {
    const newIndex = featuredGames.findIndex(g => g.id === supportingGames[index].id);
    setActiveIndex(newIndex);
  };

  if (!mainFeatured) {
    return null;
  }

  return (
    <section className="featured-deals">
      <div className="featured-deals-container">
        <div className="CardPanelCarouselHeading">
          <h2 className="featured-deals-title">Featured Deals</h2>
        </div>

        <div className="CardPanelCarousel__panel">
          {/* Main Featured Card */}
          <div className="CardPanelCarousel__main">
            <div className="featured-main-image">
              <img src={mainFeatured.image} alt={mainFeatured.title} />
              {mainFeatured.discount > 0 && (
                <div className="featured-main-discount">-{mainFeatured.discount}%</div>
              )}
            </div>

            <div className="featured-main-info">
              <span className="featured-main-category">{mainFeatured.category}</span>
              <h3 className="featured-main-title">{mainFeatured.title}</h3>
              <p className="featured-main-description">{mainFeatured.description}</p>

              <div className="featured-main-rating">
                <span className="rating">⭐ {mainFeatured.rating}</span>
                <span className="review-count">({mainFeatured.reviews} reviews)</span>
              </div>

              <div className="featured-main-pricing">
                <span className="main-price">${mainFeatured.price}</span>
                {mainFeatured.discount > 0 && (
                  <span className="main-original-price">${mainFeatured.originalPrice}</span>
                )}
              </div>

              <button
                className="featured-main-btn text-[#212121]"
                onClick={() => handleAddToCart(mainFeatured)}
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Support Cards Carousel */}
          <div className="CardPanelCarousel__support">
            {supportingGames.map((game, index) => (
              <div
                key={game.id}
                className="CardPanelCarousel__support__container"
                onClick={() => handleSupportCardClick(index)}
              >
                <div className="support-card-image">
                  <img src={game.image} alt={game.title} />
                  {game.discount > 0 && (
                    <div className="support-card-discount">-{game.discount}%</div>
                  )}
                </div>

                <div className="support-card-content">
                  <h4 className="support-card-title">{game.title}</h4>
                  <p className="support-card-category">{game.category}</p>

                  <div className="support-card-pricing">
                    <span className="support-price">${game.price}</span>
                    {game.discount > 0 && (
                      <span className="support-original-price">${game.originalPrice}</span>
                    )}
                  </div>

                  <div className="support-card-rating">
                    <span>⭐ {game.rating}</span>
                  </div>
                </div>

                <button
                  className="support-card-btn text-[#212121]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(game);
                  }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
