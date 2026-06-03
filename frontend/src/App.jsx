import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Account,
  DeveloperAccount,
  Orders,
  CouponsRewards,
  CartPage,
  Checkout,
  CheckoutSuccess,
  ErrorBoundary,
  NotFound,
  CustomerOnly,
  Footer
} from './components'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

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

  const AccountWrapper = () => {
    const userType = useSelector(state => state.auth.userType);
    return userType === 'DEVELOPER' ? <DeveloperAccount /> : <Account />;
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
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
                {/* TODO: <GamersRecommend /> */}
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

        <Route
          path="/account"
          element={
            <Layout>
              <AccountWrapper />
            </Layout>
          }
        />

        <Route
          path="/account/login"
          element={
            <Layout>
              <AccountWrapper />
            </Layout>
          }
        />

        <Route
          path="/account/payment"
          element={
            <Layout>
              <AccountWrapper />
            </Layout>
          }
        />

        <Route
          path="/orders"
          element={
            <Layout>
              <Orders />
            </Layout>
          }
        />

        <Route
          path="/cart"
          element={
            <Layout>
              <CustomerOnly>
                <CartPage />
              </CustomerOnly>
            </Layout>
          }
        />

        <Route
          path="/checkout"
          element={
            <Layout>
              <CustomerOnly>
                <Checkout />
              </CustomerOnly>
            </Layout>
          }
        />

        <Route
          path="/checkout/success"
          element={
            <Layout>
              <CustomerOnly>
                <CheckoutSuccess />
              </CustomerOnly>
            </Layout>
          }
        />

        <Route
          path="/coupons-rewards"
          element={
            <Layout>
              <CouponsRewards />
            </Layout>
          }
        />

        <Route
          path="/dev/games"
          element={
            <Layout>
              <DeveloperAccount />
            </Layout>
          }
        />

        <Route
          path="/dev/add"
          element={
            <Layout>
              <DeveloperAccount />
            </Layout>
          }
        />

        <Route
          path="/dev/update"
          element={
            <Layout>
              <DeveloperAccount />
            </Layout>
          }
        />

        <Route
          path="/dev/remove"
          element={
            <Layout>
              <DeveloperAccount />
            </Layout>
          }
        />

        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App
