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

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [error, setError] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

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
      setError("Please select a payment method.");
      return;
    }
    setError("");

    const total = getCartTotal();
    const itemsSummary = cart.map((i) => `${i.name} ×${i.qty}`).join(", ");
    const slotLabel = getSlotLabel();

    // Online Razorpay Payment Checkout
    if (paymentMethod === "razorpay") {
      try {
        setIsProcessing(true);
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError("Failed to load Razorpay SDK. Please check your internet connection.");
          setIsProcessing(false);
          return;
        }

        // 1. Create Razorpay order on backend
        const res = await api.post("/orders/create-razorpay-order", { amount: total });

        // 2. Open Razorpay Modal
        const options = {
          key: res.data.keyId,
          amount: res.data.amount,
          currency: res.data.currency,
          name: "Canteen Preorder System",
          description: `Online Food Preorder (${cart.length} item(s))`,
          order_id: res.data.id,
          prefill: {
            name,
            email: user?.email,
          },
          theme: {
            color: "#e65100",
          },
          handler: async function (response) {
            try {
              // 3. Verify payment signature on backend
              const verifyRes = await api.post("/orders/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userName: name,
                userEmail: user.email,
                rollNumber: roll,
                department,
                items: cart,
                totalAmount: total,
                slot: slotLabel,
                paymentMethod: "Razorpay (Online)",
              });

              setIsOrderPlaced(true);
              localStorage.setItem("canteen.lastOrder", verifyRes.data.tokenNumber);
              clearCart();
              alert("Payment Verified! Order Placed Successfully.");
              navigate(`/token?t=${verifyRes.data.tokenNumber}`);
            } catch (err) {
              console.error("Payment verification failed:", err);
              setError(err.response?.data?.message || "Payment verification failed. Please contact support.");
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          console.error("Razorpay Payment Failed:", response.error);
          setError(`Payment Failed: ${response.error.description || response.error.reason || "Payment was not completed"}`);
          setIsProcessing(false);
        });
        rzp.open();
      } catch (err) {
        console.error("Razorpay order creation failed:", err);
        setError(err.response?.data?.message || "Failed to initialize online payment. Please check your network or browser settings.");
        setIsProcessing(false);
      }
      return;
    }

    // Direct / Offline UPI order option fallback
    const confirmed = window.confirm(
      `Confirm your order?\n\nItems: ${itemsSummary}\nTotal: ₹${total}\nSlot: ${slotLabel}\nPayment: ${paymentMethod.toUpperCase()}\n\n⚠️ No cancellation after this step.`
    );

    if (!confirmed) return;

    try {
      setIsProcessing(true);
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
      
      setIsOrderPlaced(true);
      localStorage.setItem("canteen.lastOrder", response.data.tokenNumber);
      clearCart();
      alert("Order Placed Successfully!");
      navigate(`/token?t=${response.data.tokenNumber}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
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
            <p>Verify your details and choose your preferred payment option to get your food token.</p>
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

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  {/* Razorpay Online Gateway Option */}
                  <button
                    type="button"
                    className={`pay-opt ${paymentMethod === "razorpay" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("razorpay")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 18px",
                      borderRadius: "10px",
                      border: paymentMethod === "razorpay" ? "2px solid var(--orange, #e65100)" : "1px solid var(--border, #e0e0e0)",
                      background: paymentMethod === "razorpay" ? "var(--cream, #fff8f0)" : "#fff",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                  >
                    <span style={{ fontSize: "22px" }}>💳</span>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div>Razorpay Online Gateway (Instant Verification)</div>
                      <div style={{ fontSize: "12px", fontWeight: "normal", color: "#666" }}>
                        Pay via UPI, Credit/Debit Cards, NetBanking, & Wallets
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", background: "#e65100", color: "#fff", padding: "3px 8px", borderRadius: "12px" }}>
                      Recommended
                    </span>
                  </button>

                  {/* Direct UPI options */}
                  <div className="upi-apps">
                    {["gpay", "phonepe", "paytm", "bhim"].map((app) => (
                      <button
                        key={app}
                        type="button"
                        className={`upi-app pay-opt ${paymentMethod === app ? "selected" : ""}`}
                        onClick={() => setPaymentMethod(app)}
                        style={{
                          border: paymentMethod === app ? "2px solid var(--orange, #e65100)" : "1px solid var(--border, #e0e0e0)",
                          background: paymentMethod === app ? "var(--cream, #fff8f0)" : "#fff",
                        }}
                      >
                        {app === "gpay" && "Google Pay"}
                        {app === "phonepe" && "PhonePe"}
                        {app === "paytm" && "Paytm"}
                        {app === "bhim" && "BHIM UPI"}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === "razorpay" && (
                  <div style={{ animation: "fadeUp 0.3s ease", padding: "12px", background: "#f9f9f9", borderRadius: "8px", border: "1px solid #eee" }}>
                    <div className="payment-method">
                      <span className="payment-icon">⚡</span>
                      <div>
                        <div className="payment-title">Automated Razorpay Checkout</div>
                        <div className="payment-subtitle">
                          You will be prompted with Razorpay's modal to pay <b>₹{total}</b> securely.
                        </div>
                      </div>
                    </div>
                    <div className="secure-payment" style={{ marginTop: "8px" }}>
                      <span>🔒</span> 256-bit Encrypted Razorpay SSL
                    </div>
                  </div>
                )}

                {paymentMethod && paymentMethod !== "razorpay" && (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    <div className="payment-method">
                      <span className="payment-icon">📱</span>
                      <div>
                        <div className="payment-title">Direct UPI / QR Transfer</div>
                        <div className="payment-subtitle">
                          Open {paymentMethod.toUpperCase()}, scan the QR code below, and transfer <b>₹{total}</b> to the canteen.
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
                      <span>🔒</span> Safe & Secure Checkout
                    </div>
                  </div>
                )}

                <div className="payment-note" style={{ marginTop: "16px" }}>
                  <strong>Notice:</strong> Your order token is generated immediately upon placing the order. Show the digital token screen at the counter to claim your food.
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

              <button
                className="pay-btn"
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                data-testid="place-order-btn"
              >
                {isProcessing
                  ? "Processing..."
                  : paymentMethod === "razorpay"
                  ? `Pay ₹${total} via Razorpay`
                  : `Place Order (Pay ₹${total})`}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Billing;