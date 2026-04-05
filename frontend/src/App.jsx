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
        <BundlesSection />

        <div className="content-wrapper">
          <Sidebar />
          <GameGrid />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
