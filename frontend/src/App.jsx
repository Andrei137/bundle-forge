import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Header,
  FeaturedDeals,
  TopSellers,
  ShoppingCart,
  GameDetailsModal,
  GameFinder,
  GamersRecommend,
  MoreGameBundles,
  Game,
  Footer
} from './components'
import './App.css'

function App() {
  const Layout = ({ children }) => (
    <div className="site-dark-theme brand-bundle-forge">
      <Header />
      <ShoppingCart />
      <GameDetailsModal />

      <main className="main-content">
        {children}
      </main>

      <Footer />
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <>
                <FeaturedDeals />
                <TopSellers />
                <MoreGameBundles />
                <GameFinder />
                <GamersRecommend />
              </>
            </Layout>
          }
        />

        <Route
          path="/game/:slug"
          element={
            <Layout>
              <Game />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
