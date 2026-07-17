import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../utils/api";
import "../style/Cart.css";

const TIME_SLOTS = [
  { id: "short", label: "Short Break — 11:00 to 11:15" },
  { id: "lunch", label: "Lunch Break — 1:15 to 2:00" },
];

function Cart() {
  const {
    cart,
    slot,
    setSlot,
    updateQty,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  } = useContext(CartContext);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError("Cart is empty");
      return;
    }
    if (!slot) {
      setError("Please select a time slot");
      return;
    }
    setError("");
    navigate("/billing");
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm("Remove all items from cart?")) {
      clearCart();
    }
  };

  const total = getCartTotal();
  const count = getCartCount();

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="cart-page">
          <div className="page-head" style={{ marginBottom: "10px" }}>
            <div>
              <h1>Your Cart</h1>
              <p className="cart-subtitle">Review items and schedule your meal pickup.</p>
            </div>
            {cart.length > 0 && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleClearCart}
                style={{ color: "#d62828", borderColor: "#fde2e2" }}
                data-testid="clear-cart-btn"
              >
                Clear Cart 🗑
              </button>
            )}
          </div>

          {error && (
            <div className="alert error" id="cart-error" style={{ display: "block" }}>
              {error}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="empty-cart" data-testid="empty-state">
              <h2>Your cart is empty</h2>
              <p>Add some delicious meals from our canteen menu to get started.</p>
              <Link to="/menu" className="shop-btn">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="cart-page-grid">
              {/* Column 1: Items List */}
              <div className="cart-items">
                {cart.map((item) => (
                  <div className="cart-item" key={item._id} data-testid={`cart-row-${item._id}`}>
                    <img
                      src={`${API_BASE_URL}/uploads/foods/${item.image}`}
                      alt={item.name}
                      className="cart-img"
                    />
                    <div className="cart-info">
                      <span className="cart-category">{item.category}</span>
                      <h3>{item.name}</h3>
                      <div className="cart-price">₹{item.price}</div>
                      
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          data-testid={`dec-${item._id}`}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          data-testid={`inc-${item._id}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item._id)}
                        data-testid={`remove-${item._id}`}
                      >
                        Remove item
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Cart Summary & Slot Selection */}
              <div className="cart-summary">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Total Items</span>
                  <span>{count}</span>
                </div>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                
                <h3 style={{ margin: "24px 0 12px", fontSize: "16px", color: "var(--brown)" }}>
                  Select Pickup Time Slot
                </h3>
                <div className="slot-group" id="slot-group">
                  {TIME_SLOTS.map((s) => (
                    <label
                      key={s.id}
                      className={`slot-opt ${slot === s.id ? "selected" : ""}`}
                      data-testid={`slot-${s.id}`}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={s.id}
                        checked={slot === s.id}
                        onChange={(e) => setSlot(e.target.value)}
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>

                <div className="summary-total">
                  <span>Grand Total</span>
                  <span data-testid="cart-total">₹{total}</span>
                </div>

                <button className="checkout-btn" onClick={handleCheckout} data-testid="checkout-btn">
                  Proceed To Billing
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Cart;