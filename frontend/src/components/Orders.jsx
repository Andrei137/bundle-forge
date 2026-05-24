import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AccountIcon from '@/assets/icons/account.svg?react';
import LoginSecurityIcon from '@/assets/icons/login_security.svg?react';
import PaymentIcon from '@/assets/icons/payment_information.svg?react';
import OrdersIcon from '@/assets/icons/order_history_keys.svg?react';
import LibraryIcon from '@/assets/icons/library.svg?react';
import CouponsIcon from '@/assets/icons/coupoun_rewards.svg?react';
import { checkoutService } from '../services/checkoutService';
import './Orders.css';

const statusClass = (status) => {
  if (status === 'PAYMENT_SUCCEEDED') return 'order-status--succeeded';
  if (status === 'PAYMENT_FAILED') return 'order-status--failed';
  return 'order-status--pending';
};

const statusLabel = (status) => {
  switch (status) {
    case 'PAYMENT_SUCCEEDED': return 'Succeeded';
    case 'PAYMENT_FAILED': return 'Failed';
    case 'CREATED': return 'Pending';
    default: return status?.toLowerCase().replace(/_/g, ' ') || 'Unknown';
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const summarizeItems = (items) => {
  if (!items || items.length === 0) return '—';
  if (items.length === 1) return items[0].title;
  return `${items[0].title} +${items.length - 1} more`;
};

export const Orders = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    let cancelled = false;
    checkoutService.listOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, navigate]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      order.items.some((item) => item.title.toLowerCase().includes(term))
    );
  }, [orders, searchTerm]);

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: AccountIcon, action: () => navigate('/account'), isParent: true },
    { id: 'security', label: 'Login & Security', icon: LoginSecurityIcon, action: () => navigate('/account/login'), isChild: true },
    { id: 'payment', label: 'Payment Information', icon: PaymentIcon, action: () => navigate('/account/payment'), isChild: true },
    { id: 'orders', label: 'Order History & Keys', icon: OrdersIcon, action: () => {} },
    { id: 'coupons', label: 'Coupons & Rewards', icon: CouponsIcon, action: () => navigate('/coupons-rewards') },
  ];

  const copyKey = (key) => {
    if (!key) return;
    navigator.clipboard?.writeText(key);
  };

  const renderTable = () => {
    if (loading) return <div className="orders-empty"><p>Loading orders…</p></div>;
    if (error) return <div className="orders-empty"><p>{error}</p></div>;
    if (filteredOrders.length === 0) {
      return (
        <div className="orders-empty">
          <p>No orders found. Start shopping to see your order history!</p>
        </div>
      );
    }

    return (
      <div className="orders-table">
        <div className="orders-header">
          <div>DATE</div>
          <div>ITEMS</div>
          <div>STATUS</div>
          <div>ACTION</div>
        </div>
        {filteredOrders.map((order) => (
          <div key={order.id}>
            <div className="order-row">
              <div>{formatDate(order.createdAt)}</div>
              <div>{summarizeItems(order.items)}</div>
              <div>
                <span className={`order-status ${statusClass(order.status)}`}>
                  {statusLabel(order.status)}
                </span>
              </div>
              <div>
                <button
                  type="button"
                  className="order-row-button"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  {expanded === order.id ? 'Hide Order & Keys' : 'View Order & Keys'}
                </button>
              </div>
            </div>
            {expanded === order.id && (
              <div className="order-keys-panel">
                <h4>Keys</h4>
                {order.items.map((item) => (
                  <div key={item.gameId} className="order-key-row">
                    <span>{item.title}</span>
                    {item.gameKey ? (
                      <>
                        <code>{item.gameKey}</code>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyKey(item.gameKey)}
                        >
                          Copy
                        </button>
                      </>
                    ) : (
                      <code className="muted">
                        {order.status === 'PAYMENT_SUCCEEDED' ? 'no key available' : 'pending'}
                      </code>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

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

          {renderTable()}
        </main>
      </div>
    </div>
  );
};
