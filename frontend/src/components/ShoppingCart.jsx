import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../redux/slices/cartSlice';
import { closeCart } from '../redux/slices/uiSlice';
import './ShoppingCart.css';

export const ShoppingCart = () => {
  const dispatch = useDispatch();
  const cartOpen = useSelector(state => state.ui.cartOpen);
  const { items, total, savedTotal } = useSelector(state => state.cart);

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleQuantityChange = (itemId, quantity) => {
    if (quantity > 0) {
      dispatch(updateQuantity({ id: itemId, quantity }));
    }
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout with total: RON ' + total.toFixed(2));
    dispatch(clearCart());
    dispatch(closeCart());
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
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} className="cart-item-image" />

                  <div className="cart-item-details">
                    <h4>{item.title}</h4>
                    <p className="cart-item-price">RON {item.price}</p>
                  </div>

                  <div className="cart-item-quantity">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="qty-btn"
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="qty-btn"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="cart-remove"
                    onClick={() => handleRemoveItem(item.id)}
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
              <div className="summary-row subtotal">
                <span>Subtotal</span>
                <span>RON {total.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>RON {total.toFixed(2)}</span>
              </div>
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
