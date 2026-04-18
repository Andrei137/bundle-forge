import {
  Header,
  FeaturedDeals,
  TopSellers,
  GameBundlesSlider,
  Sidebar,
  GameGrid,
  BundlesSection,
  ShoppingCart,
  GameDetailsModal,
  GameFinder,
  GamersRecommend,
  Footer
} from './components'
import './App.css'

function App() {
  return (
    <div className="site-dark-theme brand-bundle-forge">
      <Header />
      <ShoppingCart />
      <GameDetailsModal />

      <main className="main-content">
        <FeaturedDeals />
        <TopSellers />
        <GameBundlesSlider />
        <GameFinder />
        <GamersRecommend />
      </main>

      <Footer />
    </div>
  )
}

export default App
