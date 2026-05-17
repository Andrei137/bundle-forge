import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { checkoutService } from '../services/checkoutService';
import './Checkout.css';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      className={`checkout-success-key__copy${copied ? ' checkout-success-key__copy--copied' : ''}`}
      onClick={handleCopy}
      disabled={!text}
      title="Copy key"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

export const CheckoutSuccess = () => {
  const [params] = useSearchParams();
  const paymentUuid = params.get('paymentUuid');
  const [status, setStatus] = useState(paymentUuid ? 'loading' : 'error');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(paymentUuid ? null : 'Missing payment reference.');
  const pollsRef = useRef(0);

  useEffect(() => {
    if (!paymentUuid) return;

    let cancelled = false;
    let timer = null;

    const poll = async () => {
      try {
        const payment = await checkoutService.getPaymentStatus(paymentUuid);
        if (cancelled) return;
        if (payment.status === 'PAYMENT_SUCCEEDED' && payment.paymentId) {
          const orderDetails = await checkoutService.getOrder(payment.paymentId);
          if (cancelled) return;
          setOrder(orderDetails);
          setStatus('success');
          return;
        }
        if (payment.status === 'PAYMENT_FAILED') {
          setStatus('failed');
          return;
        }
        pollsRef.current += 1;
        if (pollsRef.current >= MAX_POLLS) {
          setStatus('pending');
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [paymentUuid]);

  return (
    <div className="checkout-page">
      <div className="checkout-success-card">
        {status === 'loading' && (
          <>
            <h1>Confirming your payment…</h1>
            <p>Hang tight while we wait for Stripe to confirm the charge.</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <h1>Payment received</h1>
            <p>
              Stripe is still finalizing your purchase. Your keys will appear in
              "Order History &amp; Keys" once confirmed.
            </p>
            <div className="checkout-success-actions">
              <Link className="primary" to="/orders">View order history</Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <h1>Payment failed</h1>
            <p>Your card was not charged. Please try a different payment method.</p>
            <div className="checkout-success-actions">
              <Link className="primary" to="/">Continue shopping</Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>Something went wrong</h1>
            <p>{error || 'Could not load the order.'}</p>
            <div className="checkout-success-actions">
              <Link className="primary" to="/orders">Go to order history</Link>
            </div>
          </>
        )}

        {status === 'success' && order && (
          <>
            <h1>Thank you! 🎉</h1>
            <p>Your payment was successful. Here are the keys for your new games:</p>

            <div className="checkout-success-keys">
              <h3>Game keys</h3>
              {order.items.map((item) => (
                <div key={item.gameId} className="checkout-success-key">
                  <span>{item.title}</span>
                  <code>{item.gameKey || 'pending…'}</code>
                  <CopyButton text={item.gameKey} />
                </div>
              ))}
            </div>

            <div className="checkout-coupon-banner">
              <span className="checkout-coupon-banner__icon">🎁</span>
              <div className="checkout-coupon-banner__text">
                <strong>You've earned a 5% discount coupon!</strong>
                <span>A coupon has been added to your account as a thank-you for your purchase.</span>
              </div>
              <Link className="checkout-coupon-banner__link" to="/coupons-rewards">View coupon</Link>
            </div>

            <div className="checkout-success-actions">
              <Link className="primary" to="/orders">View all orders</Link>
              <Link className="secondary" to="/product-library">Open library</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
