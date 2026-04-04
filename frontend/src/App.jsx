import {
  Header,
  HeroSection,
  FeaturedDeals,
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
        <HeroSection />
        <FeaturedDeals />
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
