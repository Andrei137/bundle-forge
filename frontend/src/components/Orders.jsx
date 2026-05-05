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
import './Orders.css';

export const Orders = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // Placeholder - would be fetched from backend
  const orders = [];

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/account'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => navigate('/account/payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => {} },
    { id: 'library', label: 'Product Library', icon: LibraryIcon, action: () => navigate('/product-library') },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => navigate('/coupons-rewards') },
    { id: 'support', label: 'Support', icon: SupportIcon, action: () => navigate('/support') },
  ];

  return (
    <div className="orders-container">
      <div className="orders-layout">
        <aside className="orders-sidebar">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${item.id === 'orders' ? 'active' : ''} ${item.isChild ? 'sidebar-item-child' : ''}`}
              onClick={item.action}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="orders-content">
          <h1>Order History & Keys</h1>
          <p className="orders-description">To view an order in more detail, and to view the keys associated with that order, simply click on View Order & Keys for the appropriate order.</p>

          <div className="orders-filters">
            <input
              type="text"
              placeholder="Search for a specific game"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="orders-search"
            />
          </div>

          {orders.length === 0 ? (
            <div className="orders-empty">
              <p>No orders found. Start shopping to see your order history!</p>
            </div>
          ) : (
            <div className="orders-table">
              <div className="orders-header">
                <div>DATE</div>
                <div>ITEMS</div>
                <div>STATUS</div>
                <div>ACTION</div>
              </div>
              {orders.map((order, idx) => (
                <div key={idx} className="order-row">
                  <div>{order.date}</div>
                  <div>{order.items}</div>
                  <div>{order.status}</div>
                  <div>
                    <a href={`#`}>View Order & Keys</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="steam-sync-section">
            <h3>Sync your Steam Wishlist</h3>
            <p>Connect your steam account and you can import your games from your Steam Wishlist</p>
            <button className="btn-steam">SYNC STEAM WISHLIST</button>
          </div>
        </main>
      </div>
    </div>
  );
};
