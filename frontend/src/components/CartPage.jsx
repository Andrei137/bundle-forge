import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import './CartPage.css';

const API_URL = import.meta.env.VITE_API_URL;

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" aria-hidden="true">
    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 124 33" fill="none" width="52" height="14" aria-label="PayPal">
    <text x="0" y="24" fontFamily="system-ui,sans-serif" fontSize="22" fontWeight="700" fill="#003087">Pay</text>
    <text x="42" y="24" fontFamily="system-ui,sans-serif" fontSize="22" fontWeight="700" fill="#009cde">Pal</text>
  </svg>
);

const calcDiscount = (item) =>
  item.discount ??
  (item.originalPrice && item.originalPrice > item.price
    ? Math.round((1 - item.price / item.originalPrice) * 100)
    : 0);

const DiscountBadge = ({ pct }) =>
  pct > 0 ? <span className="cp-badge">-{pct}%</span> : null;

const RemoveBtn = ({ onClick, label }) => (
  <button className="cp-remove" onClick={onClick} aria-label={label}>
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  </button>
);

const GameRow = ({ item, inBundle }) => {
  const dispatch = useDispatch();
  const discount = calcDiscount(item);

  return (
    <div className={`cp-game-row${inBundle ? ' cp-game-row--bundled' : ''}`}>
      {item.image
        ? <img src={item.image} alt={item.title} className="cp-game-img" loading="lazy" />
        : <div className="cp-game-img cp-game-img--placeholder" aria-hidden="true" />
      }

      <div className="cp-game-meta">
        <span className="cp-game-title">{item.title}</span>
      </div>

      <DiscountBadge pct={discount} />

      <div className="cp-game-price-group">
        {item.originalPrice && item.originalPrice > item.price && (
          <span className="cp-price-was">RON {Number(item.originalPrice).toFixed(2)}</span>
        )}
        <span className="cp-price-now">RON {Number(item.price).toFixed(2)}</span>
      </div>

      {!inBundle && (
        <div className="cp-qty" role="group" aria-label={`Quantity for ${item.title}`}>
          <button
            className="cp-qty-btn"
            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
            disabled={item.quantity <= 1}
            aria-label="Decrease quantity"
          >−</button>
          <span className="cp-qty-val" aria-live="polite">{item.quantity}</span>
          <button
            className="cp-qty-btn"
            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
            aria-label="Increase quantity"
          >+</button>
        </div>
      )}

      <RemoveBtn
        onClick={() => dispatch(removeFromCart(item.id))}
        label={`Remove ${item.title}`}
      />
    </div>
  );
};

const BundleGroup = ({ group }) => {
  const dispatch = useDispatch();
  const bundleTotal = group.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const removeAll = () =>
    group.items.forEach(item => dispatch(removeFromCart(item.id)));

  return (
    <section className="cp-bundle-group" aria-label={`Bundle: ${group.bundleName}`}>
      <div className="cp-bundle-header">
        <span className="cp-bundle-name">Build your own {group.bundleName}</span>
        <div className="cp-bundle-header-right">
          <span className="cp-bundle-total">RON {bundleTotal.toFixed(2)}</span>
          <RemoveBtn onClick={removeAll} label={`Remove bundle ${group.bundleName}`} />
        </div>
      </div>

      <div className="cp-bundle-games">
        {group.items.map(item => (
          <GameRow key={item.id} item={item} inBundle />
        ))}
      </div>
    </section>
  );
};

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 220ms ease-out' }}
    aria-hidden="true">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

const CouponBox = () => {
  const dispatch = useDispatch();
  const coupon = useSelector(state => state.cart.coupon);
  const couponDiscount = useSelector(state => state.cart.couponDiscount);

  const [open, setOpen] = useState(true);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_URL}/coupons/${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Invalid coupon');
      dispatch(applyCoupon(data));
      setSuccess(`"${data.name}" applied`);
      setCode('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    dispatch(removeCoupon());
    setSuccess('');
    setError('');
  };

  return (
    <div className="cp-coupon">
      <button className="cp-coupon-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>Coupons</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="cp-coupon-body">
          {coupon ? (
            <div className="cp-coupon-applied-row">
              <div className="cp-coupon-applied-info">
                <span className="cp-coupon-applied-name">{coupon.name}</span>
                <span className="cp-coupon-applied-saving">-RON {couponDiscount.toFixed(2)}</span>
              </div>
              <button className="cp-coupon-remove-btn" onClick={handleRemove} aria-label="Remove coupon">
                Remove
              </button>
            </div>
          ) : (
            <>
              <p className="cp-coupon-hint">Do you have a coupon code?</p>
              <div className="cp-coupon-field">
                <input
                  className="cp-coupon-input"
                  type="text"
                  placeholder="Enter coupon code"
                  value={code}
                  onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); setSuccess(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleApply()}
                  aria-label="Coupon code"
                  maxLength={14}
                />
                <button
                  className="cp-coupon-apply"
                  onClick={handleApply}
                  disabled={!code.trim() || loading}
                >
                  {loading ? '...' : 'Apply'}
                </button>
              </div>
              {error && <p className="cp-coupon-feedback cp-coupon-feedback--error">{error}</p>}
              {success && <p className="cp-coupon-feedback cp-coupon-feedback--success">{success}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const CartPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { items, total, savedTotal, couponDiscount } = useSelector(state => state.cart);

  const fullPrice = savedTotal > 0 ? total + savedTotal : null;

  const groups = items.reduce((acc, item) => {
    const key = item.bundleId ?? '__individual__';
    if (!acc[key]) acc[key] = { bundleId: item.bundleId, bundleName: item.bundleName, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  const bundleGroups = Object.values(groups).filter(g => g.bundleId);
  const individualItems = groups['__individual__']?.items ?? [];
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    navigate(isAuthenticated ? '/checkout' : '/account/login');
  };

  if (items.length === 0) {
    return (
      <div className="cp-page">
        <h1 className="cp-title"><LockIcon /> Your Secure Cart</h1>
        <div className="cp-empty">
          <p className="cp-empty-headline">Your cart is empty</p>
          <p className="cp-empty-sub">Find deals and build your bundle</p>
          <button className="cp-btn-primary" onClick={() => navigate('/')}>Browse games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <h1 className="cp-title"><LockIcon /> Your Secure Cart</h1>

      <div className="cp-layout">
        <div className="cp-items-col">
          {bundleGroups.map(group => (
            <BundleGroup key={group.bundleId} group={group} />
          ))}

          {individualItems.length > 0 && (
            <section className="cp-individual-section" aria-label="Individual games">
              {individualItems.map(item => (
                <GameRow key={item.id} item={item} inBundle={false} />
              ))}
            </section>
          )}
        </div>

        <div className="cp-right-col">
        <aside className="cp-summary" aria-label="Cart summary">
          <h2 className="cp-summary-title">Cart Summary</h2>

          {fullPrice && (
            <div className="cp-summary-row">
              <span>Full price</span>
              <span className="cp-summary-val cp-summary-val--was">RON {fullPrice.toFixed(2)}</span>
            </div>
          )}

          {savedTotal > 0 && (
            <div className="cp-summary-row">
              <span>Your saving</span>
              <span className="cp-summary-val cp-summary-val--saving">-RON {savedTotal.toFixed(2)}</span>
            </div>
          )}

          {couponDiscount > 0 && (
            <div className="cp-summary-row">
              <span>Coupon savings</span>
              <span className="cp-summary-val cp-summary-val--saving">-RON {couponDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="cp-summary-total">
            <span>Total</span>
            <span className="cp-summary-total-val">RON {(total - couponDiscount).toFixed(2)}</span>
          </div>

          <p className="cp-summary-note">
            Prices displayed in New Romanian Leu
          </p>

          <button className="cp-btn-checkout" onClick={handleCheckout}>
            <LockIcon /> Proceed to Checkout
          </button>

          <div className="cp-guarantee">
            <ShieldIcon />
            <div>
              <p className="cp-guarantee-title">14 Day Money Back Guarantee</p>
              <p className="cp-guarantee-desc">
                We'll promptly refund any order within 14 days (provided keys haven't been revealed).
              </p>
            </div>
          </div>
        </aside>

        <CouponBox />
        </div>
      </div>
    </div>
  );
};
