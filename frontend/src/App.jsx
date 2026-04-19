import {
  Header,
  FeaturedDeals,
  TopSellers,
  ShoppingCart,
  GameDetailsModal,
  GameFinder,
  GamersRecommend,
  MoreGameBundles,
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
        <MoreGameBundles />
        <GameFinder />
        <GamersRecommend />
      </main>

      <Footer />
    </div>
  )
}

export default App
