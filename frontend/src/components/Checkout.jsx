import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { clearCart } from '../redux/slices/cartSlice';

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);
import { checkoutService } from '../services/checkoutService';
import './Checkout.css';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const generateIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const PaymentForm = ({ paymentUuid, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const returnUrl = `${window.location.origin}/checkout/success?paymentUuid=${encodeURIComponent(paymentUuid)}`;

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
      return;
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button className="checkout-pay-btn" type="submit" disabled={!stripe || submitting}>
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
      {error && <div className="checkout-error">{error}</div>}
    </form>
  );
};

export const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const cartItems = useSelector((state) => state.cart.items);
  const cartTotal = useSelector((state) => state.cart.total);
  const coupon = useSelector((state) => state.cart.coupon);
  const couponDiscount = useSelector((state) => state.cart.couponDiscount);

  const [clientSecret, setClientSecret] = useState(null);
  const [paymentUuid, setPaymentUuid] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const payableItems = useMemo(
    () => cartItems.filter((i) => Number.isInteger(i.id)),
    [cartItems]
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/account/login');
      return;
    }
    if (payableItems.length === 0) return;

    const items = payableItems.map((i) => ({ gameId: i.id, quantity: i.quantity }));

    // Reuse the key only when the cart contents haven't changed (retry safety).
    // If the cart changed, generate a new key so a fresh PaymentIntent is created.
    const cartHash = payableItems.map((i) => `${i.id}:${i.quantity}`).join(',');
    const storedKey = sessionStorage.getItem('bundleforge_idem_key');
    const storedHash = sessionStorage.getItem('bundleforge_idem_hash');
    const idempotencyKey = (storedKey && storedHash === cartHash)
      ? storedKey
      : generateIdempotencyKey();
    sessionStorage.setItem('bundleforge_idem_key', idempotencyKey);
    sessionStorage.setItem('bundleforge_idem_hash', cartHash);

    let cancelled = false;
    setCreating(true);

    checkoutService
      .createPayment(items, idempotencyKey, coupon?.code)
      .then((res) => {
        if (cancelled) return;
        if (!res.clientSecret) return;
        setClientSecret(res.clientSecret);
        setPaymentUuid(res.paymentUuid);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setCreating(false); });

    return () => { cancelled = true; };
  }, [isAuthenticated, payableItems, navigate]);

  const handleSuccess = () => {
    sessionStorage.removeItem('bundleforge_idem_key');
    sessionStorage.removeItem('bundleforge_idem_hash');
    dispatch(clearCart());
    navigate(`/checkout/success?paymentUuid=${encodeURIComponent(paymentUuid)}`);
  };

  if (!stripePublishableKey) {
    return (
      <div className="checkout-page">
        <div className="checkout-config-warning">
          Stripe is not configured. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in your frontend
          environment to enable checkout.
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <h1 className="checkout-page__title">Checkout</h1>
        <div className="checkout-empty">
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/')}>Continue shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 className="checkout-page__title">Checkout</h1>
      <div className="checkout-grid">
        <div className="checkout-card">
          <h2 className="checkout-payment-title"><LockIcon /> Secure Payments</h2>
          {creating && <div className="checkout-loading">Preparing secure payment…</div>}
          {error && <div className="checkout-error">{error}</div>}
          {clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <PaymentForm paymentUuid={paymentUuid} onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>

        <div className="checkout-card">
          <div className="checkout-card__title">Order Summary</div>
          <div className="checkout-summary__items">
            {cartItems.map((item) => (
              <div key={item.id} className="checkout-summary__line">
                <span className="checkout-summary__item-name">
                  {item.title}{item.quantity > 1 ? ` ×${item.quantity}` : ''}
                </span>
                <span className="checkout-summary__item-price">RON {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            {couponDiscount > 0 && (
              <div className="checkout-summary__line checkout-summary__line--coupon">
                <span>Coupon savings{coupon?.name ? ` (${coupon.name})` : ''}</span>
                <span className="checkout-summary__coupon-val">-RON {couponDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="checkout-summary__total">
            <span>TOTAL</span>
            <span className="checkout-summary__total-val">RON {(cartTotal - couponDiscount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
