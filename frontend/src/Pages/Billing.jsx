import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../style/Billing.css";

const TIME_SLOTS = [
  { id: "short", label: "Short Break — 11:00 to 11:15" },
  { id: "lunch", label: "Lunch Break — 1:15 to 2:00" },
];

function Billing() {
  const navigate = useNavigate();
  const { cart, slot, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || "",
    roll: user?.roll || "",
    department: user?.department || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [error, setError] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Redirect if cart or slot is missing
  useEffect(() => {
    if (cart.length === 0 && !isOrderPlaced) {
      navigate("/menu");
    }
  }, [cart, navigate, isOrderPlaced]);

  const handleInputChange = (e) => {
    setBillingDetails({
      ...billingDetails,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const getSlotLabel = () => {
    const s = TIME_SLOTS.find((x) => x.id === slot);
    return s ? s.label : "Not selected";
  };

  const handlePlaceOrder = async () => {
    const { name, roll, department } = billingDetails;
    if (!name || !roll || !department) {
      setError("Please fill name, roll number and department.");
      return;
    }
    if (!paymentMethod) {
      setError("Please select a payment method to continue.");
      return;
    }
    setError("");

    const total = getCartTotal();
    const itemsSummary = cart.map((i) => `${i.name} ×${i.qty}`).join(", ");
    const slotLabel = getSlotLabel();

    const confirmed = window.confirm(
      `Confirm your order?\n\nItems: ${itemsSummary}\nTotal: ₹${total}\nSlot: ${slotLabel}\nPayment: ${paymentMethod.toUpperCase()}\n\n⚠️ No cancellation after this step.`
    );

    if (!confirmed) return;

    try {
      const orderData = {
        userName: name,
        userEmail: user.email,
        rollNumber: roll,
        department,
        items: cart,
        totalAmount: total,
        slot: slotLabel,
        paymentMethod,
      };

      const response = await api.post("/orders", orderData);
      
      // Set order placed state to true to prevent redirecting to /menu
      setIsOrderPlaced(true);
      
      // Save last placed order token to localStorage
      localStorage.setItem("canteen.lastOrder", response.data.tokenNumber);
      
      // Reset cart state
      clearCart();
      
      // Show success alert and redirect to token page so they can see their token
      alert("Order Placed Successfully!");
      navigate(`/token?t=${response.data.tokenNumber}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    }
  };

  const total = getCartTotal();

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="billing-page">
          <div className="billing-header">
            <h1>Checkout & Billing</h1>
            <p>Verify your information and pay securely to get your digital token.</p>
          </div>

          {error && (
            <div className="alert error" id="b-error" style={{ display: "block" }}>
              {error}
            </div>
          )}

          <div className="billing-grid">
            {/* Column 1: Details & Payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Profile details */}
              <div className="billing-card">
                <h2>Student Details</h2>
                <div className="field" style={{ marginBottom: "12px" }}>
                  <label htmlFor="b-name">Full Name</label>
                  <input
                    id="b-name"
                    name="name"
                    type="text"
                    value={billingDetails.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="row">
                  <div className="field">
                    <label htmlFor="b-roll">Roll Number</label>
                    <input
                      id="b-roll"
                      name="roll"
                      type="text"
                      value={billingDetails.roll}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="b-dept">Department</label>
                    <input
                      id="b-dept"
                      name="department"
                      type="text"
                      value={billingDetails.department}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment selector */}
              <div className="payment-card">
                <h3>Select Payment Method</h3>
                
                <div className="upi-apps">
                  {["gpay", "phonepe", "paytm", "bhim"].map((app) => (
                    <button
                      key={app}
                      className={`upi-app pay-opt ${paymentMethod === app ? "selected" : ""}`}
                      onClick={() => setPaymentMethod(app)}
                      style={{
                        border: paymentMethod === app ? "2px solid var(--orange)" : "1px solid var(--border)",
                        background: paymentMethod === app ? "var(--cream)" : "#fff",
                      }}
                    >
                      {app === "gpay" && "Google Pay"}
                      {app === "phonepe" && "PhonePe"}
                      {app === "paytm" && "Paytm"}
                      {app === "bhim" && "BHIM UPI"}
                    </button>
                  ))}
                </div>

                {paymentMethod && (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    <div className="payment-method">
                      <span className="payment-icon">📱</span>
                      <div>
                        <div className="payment-title">Scan QR & Pay</div>
                        <div className="payment-subtitle">
                          Open your UPI app, scan the QR code below, and complete the transfer of <b>₹{total}</b>.
                        </div>
                      </div>
                    </div>

                    {/* SVG Vector QR Code */}
                    <div className="qr-box">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 29 29"
                        style={{ padding: "14px" }}
                        shapeRendering="crispEdges"
                      >
                        <path
                          d="M0 0h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm0 15h7v7H0zm1 1h5v5H1zm1 1h3v3H2zM17 0h7v7h-7zm1 1h5v5h-5zm1 1h3v3h-2zm-9 0h2v2h-2zm4 0h2v1h-2zm0 2h1v1h-1zm-2 1h1v2h-1zm5 0h1v1h-1zm1 1h1v1h-1zm-6 2h1v1h-1zm1 0h2v1h-2zm3 0h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 1h1v2h-1zm-2 2h1v1h-1zm-2 1h2v1h-2zm-3 0h1v2h-1zm3 1h1v1h-1zm-6 2h1v1h-1zm3 0h2v1h-2zm3 0h1v1h-1zm1 1h1v1h-1zm1-2h1v1h-1zm1 1h1v2h-1zm-2 2h1v1h-1zm-2 1h2v1h-2zm-3 0h1v2h-1zm3 1h1v1h-1z"
                          fill="var(--brown)"
                        />
                      </svg>
                    </div>

                    <div className="secure-payment">
                      <span>🔒</span> UPI Safe & Secure Checkout
                    </div>
                  </div>
                )}

                <div className="payment-note">
                  <strong>Notice:</strong> Your order token is generated immediately. Show the digital token screen at the counter to claim your food.
                </div>
              </div>
            </div>

            {/* Column 2: Order Summary */}
            <div className="billing-card" style={{ position: "sticky", top: "100px" }}>
              <h2>Order Summary</h2>
              
              {cart.map((item) => (
                <div className="summary-item" key={item._id} data-testid={`sum-${item._id}`}>
                  <span className="summary-name">
                    {item.name} <span style={{ color: "var(--muted)" }}>× {item.qty}</span>
                  </span>
                  <span className="summary-price">₹{item.price * item.qty}</span>
                </div>
              ))}

              <div className="summary-item" style={{ borderBottom: "none", marginTop: "20px" }}>
                <span style={{ fontWeight: 600, color: "var(--muted)" }}>Pickup Slot</span>
                <span style={{ fontWeight: 700, color: "var(--brown)" }} data-testid="sum-slot">
                  {getSlotLabel().split("—")[0].trim()}
                </span>
              </div>

              <div className="summary-total">
                <span>Total Amount</span>
                <span data-testid="sum-total">₹{total}</span>
              </div>

              <button className="pay-btn" onClick={handlePlaceOrder} data-testid="place-order-btn">
                Place Order (Pay ₹{total})
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Billing;