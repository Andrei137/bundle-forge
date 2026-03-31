import './CardPanelCarousel.css'

const supportDeals = [
  {
    id: 1,
    badge: 'Sale',
    title: 'Cyberpunk 2077',
    price: '€19.99',
  },
  {
    id: 2,
    badge: 'Bundle',
    title: 'The Witcher Trilogy',
    price: '€14.99',
  },
  {
    id: 3,
    badge: 'New',
    title: 'Elden Ring',
    price: '€29.99',
  },
  {
    id: 4,
    badge: 'Deal',
    title: 'Hollow Knight',
    price: '€7.99',
  },
]

function CardPanelCarouselHeading({ children }) {
  return <h2 className="CardPanelCarouselHeading">{children}</h2>
}

function CardPanelCarousel() {
  return (
    <section className="w-full px-8 py-6">
      <CardPanelCarouselHeading>Featured Deals</CardPanelCarouselHeading>

      <div className="CardPanelCarousel__panel">
        <div className="CardPanelCarousel__main">
          <div className="CardPanelCarousel__main__body">
            <span className="CardPanelCarousel__main__badge">Featured</span>
            <h3 className="CardPanelCarousel__main__title">
              Red Dead Redemption 2
            </h3>
            <p className="CardPanelCarousel__main__desc">
              Experience the epic tale of outlaw Arthur Morgan across a vast
              open world in this award-winning action adventure.
            </p>
            <p className="CardPanelCarousel__main__price">€24.99</p>
            <button className="CardPanelCarousel__main__btn">Add to Cart</button>
          </div>
        </div>

        <div className="CardPanelCarousel__support">
          {supportDeals.map((deal) => (
            <div key={deal.id} className="CardPanelCarousel__support__container">
              <span className="CardPanelCarousel__support__badge">
                {deal.badge}
              </span>
              <p className="CardPanelCarousel__support__title">{deal.title}</p>
              <p className="CardPanelCarousel__support__price">{deal.price}</p>
              <button className="CardPanelCarousel__support__btn">
                View Deal
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CardPanelCarousel
