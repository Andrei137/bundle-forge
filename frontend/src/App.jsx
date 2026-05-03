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
  SearchPage,
  Bundle,
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
          path="/game/:id"
          element={
            <Layout>
              <Game />
            </Layout>
          }
        />

        <Route
          path="/bundle/:id"
          element={
            <Layout>
              <Bundle />
            </Layout>
          }
        />

        <Route
          path="/search"
          element={
            <Layout>
              <SearchPage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
