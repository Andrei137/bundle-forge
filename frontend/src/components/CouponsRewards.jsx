import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
import SupportIcon from '@/assets/icons/support.svg?react';
import './CouponsRewards.css';

export const CouponsRewards = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  // Placeholder - would be fetched from backend
  const coupons = [];
  const rewards = [];

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/account'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => navigate('/account/payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => navigate('/orders') },
    { id: 'library', label: 'Product Library', icon: LibraryIcon, action: () => navigate('/product-library') },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => {} },
    { id: 'support', label: 'Support', icon: SupportIcon, action: () => navigate('/support') },
  ];

  return (
    <div className="coupons-container">
      <div className="coupons-layout">
        <aside className="coupons-sidebar">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${item.id === 'coupons' ? 'active' : ''} ${item.isChild ? 'sidebar-item-child' : ''}`}
              onClick={item.action}
            >
              <item.icon className="sidebar-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main className="coupons-content">
          <h1>Coupons & Rewards</h1>

          <div className="coupons-section">
            <h2>Your Coupons</h2>
            {coupons.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any coupons yet. Check back later for exclusive offers!</p>
              </div>
            ) : (
              <div className="coupons-grid">
                {coupons.map((coupon, idx) => (
                  <div key={idx} className="coupon-card">
                    <h3>{coupon.name}</h3>
                    <p className="code">{coupon.code}</p>
                    <p className="discount">{coupon.discount}</p>
                    <p className="expiry">Expires: {coupon.expiry}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rewards-section">
            <h2>Your Rewards</h2>
            {rewards.length === 0 ? (
              <div className="empty-state">
                <p>You haven't earned any rewards yet. Continue shopping to earn rewards!</p>
              </div>
            ) : (
              <div className="rewards-list">
                {rewards.map((reward, idx) => (
                  <div key={idx} className="reward-item">
                    <h3>{reward.name}</h3>
                    <p>{reward.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
