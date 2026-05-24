import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
import { couponsService } from '../services/couponsService';
import './CouponsRewards.css';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      className={`coupon-copy-btn${copied ? ' coupon-copy-btn--copied' : ''}`}
      onClick={handleCopy}
      title="Copy code"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export const CouponsRewards = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    couponsService.getMyCoupons()
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const rewards = [];

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/account'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => navigate('/account/payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => navigate('/orders') },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => {} },
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
            {loading ? (
              <div className="empty-state"><p>Loading…</p></div>
            ) : coupons.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any coupons yet. Check back later for exclusive offers!</p>
              </div>
            ) : (
              <div className="coupons-grid">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className={`coupon-card${coupon.status !== 'ACTIVE' ? ' coupon-card--inactive' : ''}`}>
                    <h3>{coupon.name}</h3>
                    <div className="coupon-code-row">
                      <p className="code">{coupon.code}</p>
                      <CopyButton text={coupon.code} />
                    </div>
                    <p className="discount">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}% OFF` : `${coupon.value} RON OFF`}
                    </p>
                    {coupon.expirationDate && (
                      <p className="expiry">Expires: {new Date(coupon.expirationDate).toLocaleDateString()}</p>
                    )}
                    {coupon.status !== 'ACTIVE' && (
                      <p className="coupon-status">{coupon.status}</p>
                    )}
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
