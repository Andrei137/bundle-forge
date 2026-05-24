import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import { closeCart } from '../redux/slices/uiSlice';
import './ShoppingCart.css';

const API_URL = import.meta.env.VITE_API_URL;

export const ShoppingCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartOpen = useSelector(state => state.ui.cartOpen);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const { items, total, savedTotal, coupon, couponDiscount } = useSelector(state => state.cart);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_URL}/coupons/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Invalid coupon');
      dispatch(applyCoupon(data));
      setCouponInput('');
    } catch (e) {
      setCouponError(e.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveItem = (cartKey) => {
    dispatch(removeFromCart(cartKey));
  };

  const handleQuantityChange = (cartKey, quantity) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ cartKey, quantity }));
    }
  };

  const handleCheckout = () => {
    dispatch(closeCart());
    if (!isAuthenticated) {
      navigate('/account/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      {cartOpen && (
        <div className="cart-backdrop" onClick={() => dispatch(closeCart())} />
      )}

      <aside className={`shopping-cart ${cartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Shopping Cart</h2>
          <button
            className="cart-close"
            onClick={() => dispatch(closeCart())}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <p className="cart-empty-hint">Add some games to get started!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map(item => (
                <div key={item.cartKey} className="cart-item">
                  <img src={item.image} alt={item.title} className="cart-item-image" />

                  <div className="cart-item-details">
                    <h4>{item.title}</h4>
                    <p className="cart-item-price">RON {item.price}</p>
                  </div>

                  <div className="cart-item-quantity">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.cartKey, item.quantity - 1)
                      }
                      className="qty-btn"
                      disabled={item.bundleId != null}
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.cartKey, item.quantity + 1)
                      }
                      className="qty-btn"
                      disabled={item.bundleId != null}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-remove"
                    onClick={() => handleRemoveItem(item.cartKey)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              {savedTotal > 0 && (
                <div className="summary-row savings">
                  <span>Total Savings</span>
                  <span className="savings-value">-RON {savedTotal.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="summary-row savings">
                  <span>Coupon savings {coupon && <span className="cart-coupon-tag">{coupon.name}</span>}</span>
                  <span className="savings-value">-RON {couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row subtotal">
                <span>Subtotal</span>
                <span>RON {total.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>RON {(total - couponDiscount).toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-coupon">
              {coupon ? (
                <div className="cart-coupon-applied">
                  <span>{coupon.name} applied</span>
                  <button className="cart-coupon-remove" onClick={() => dispatch(removeCoupon())}>✕</button>
                </div>
              ) : (
                <>
                  <div className="cart-coupon-row">
                    <input
                      className="cart-coupon-input"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      maxLength={14}
                    />
                    <button className="cart-coupon-btn" onClick={handleApplyCoupon} disabled={couponLoading}>
                      {couponLoading ? '...' : 'APPLY'}
                    </button>
                  </div>
                  {couponError && <p className="cart-coupon-error">{couponError}</p>}
                </>
              )}
            </div>

            <div className="cart-actions">
              <button
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Checkout
              </button>
              <button
                className="continue-shopping-btn"
                onClick={() => dispatch(closeCart())}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
