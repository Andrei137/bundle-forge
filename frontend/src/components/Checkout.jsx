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
    const idempotencyKey = sessionStorage.getItem('bundleforge_idem_key') || generateIdempotencyKey();
    sessionStorage.setItem('bundleforge_idem_key', idempotencyKey);

    let cancelled = false;
    setCreating(true);

    checkoutService
      .createPayment(items, idempotencyKey, coupon?.code)
      .then((res) => {
        if (cancelled) return;
        setClientSecret(res.clientSecret);
        setPaymentUuid(res.paymentUuid);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setCreating(false); });

    return () => { cancelled = true; };
  }, [isAuthenticated, payableItems, navigate]);

  const handleSuccess = () => {
    sessionStorage.removeItem('bundleforge_idem_key');
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
          <div className="checkout-card__title">Payment details</div>
          {creating && <div className="checkout-loading">Preparing secure payment…</div>}
          {error && <div className="checkout-error">{error}</div>}
          {clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
              <PaymentForm paymentUuid={paymentUuid} onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>

        <div className="checkout-card">
          <div className="checkout-card__title">Order summary</div>
          {cartItems.map((item) => (
            <div key={item.id} className="checkout-summary__line">
              <div className="checkout-summary__item-title">
                {item.image && <img src={item.image} alt={item.title} />}
                <span>
                  {item.title}
                  {item.quantity > 1 ? ` × ${item.quantity}` : ''}
                </span>
              </div>
              <span>RON {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {couponDiscount > 0 && (
            <div className="checkout-summary__line checkout-summary__line--coupon">
              <span>Coupon savings{coupon?.name ? ` (${coupon.name})` : ''}</span>
              <span className="checkout-summary__coupon-val">-RON {couponDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="checkout-summary__total">
            <span>Total</span>
            <span>RON {(cartTotal - couponDiscount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
