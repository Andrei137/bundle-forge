import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
import SupportIcon from '@/assets/icons/support.svg?react';
import './ProductLibrary.css';

export const ProductLibrary = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');
  const [filterOS, setFilterOS] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // Placeholder - would be fetched from backend
  const products = [];

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/account'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => navigate('/account/payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => navigate('/orders') },
    { id: 'library', label: 'Product Library', icon: LibraryIcon, action: () => {} },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => navigate('/coupons-rewards') },
    { id: 'support', label: 'Support', icon: SupportIcon, action: () => navigate('/support') },
  ];

  return (
    <div className="library-container">
      <div className="library-layout">
        <aside className="library-sidebar">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${item.id === 'library' ? 'active' : ''} ${item.isChild ? 'sidebar-item-child' : ''}`}
              onClick={item.action}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="library-content">
          <h1>Product Library</h1>

          <div className="library-controls">
            <div className="control-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="date">Purchase Date</option>
                <option value="name">Name</option>
                <option value="recently-added">Recently Added</option>
              </select>
            </div>

            <div className="control-group">
              <label>Product Type:</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                <option value="all">All</option>
                <option value="games">Games</option>
                <option value="bundles">Bundles</option>
                <option value="dlc">DLC</option>
              </select>
            </div>

            <div className="control-group">
              <label>Operating System:</label>
              <select value={filterOS} onChange={(e) => setFilterOS(e.target.value)} className="filter-select">
                <option value="all">All</option>
                <option value="windows">Windows</option>
                <option value="mac">Mac</option>
                <option value="linux">Linux</option>
              </select>
            </div>

            <div className="control-group">
              <input
                type="text"
                placeholder="Search product or bundle"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="library-search"
              />
            </div>

            <div className="control-group">
              <label>
                <input type="checkbox" /> Hide Revealed
              </label>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="library-empty">
              <p>Your product library is empty. Start shopping to build your collection!</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product, idx) => (
                <div key={idx} className="product-card">
                  <img src={product.image} alt={product.name} />
                  <h3>{product.name}</h3>
                  <p>{product.status}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
