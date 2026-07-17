import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import io from "socket.io-client";
import api, { API_BASE_URL } from "../utils/api";
import Navbar from "../components/Navbar";
import "../style/Token.css";

function Token() {
  const [searchParams] = useSearchParams();
  const tokenNumber = searchParams.get("t") || localStorage.getItem("canteen.lastOrder");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!tokenNumber);
  const [error, setError] = useState(
    tokenNumber ? "" : "No active order found. Please place an order first."
  );

  useEffect(() => {
    if (!tokenNumber) return;

    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/token/${tokenNumber}`);
        setOrder(response.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Establish WebSocket connection
    const socket = io(API_BASE_URL);

    // Join room when connected
    socket.on("connect", () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.email) {
            socket.emit("join", parsed.email);
          }
        } catch (e) {
          console.error(e);
        }
      }
    });

    // Listen for order status updates
    socket.on("order_updated", (updatedOrder) => {
      if (updatedOrder && updatedOrder.tokenNumber === tokenNumber) {
        setOrder(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [tokenNumber]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page" style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
          <div>Loading token details...</div>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="page" style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
          <div className="token-card" style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "22px", color: "var(--danger)", margin: "0 0 10px" }}>No Order Found</h1>
            <p className="sub" style={{ marginBottom: "20px" }}>{error || "Place an order first to receive a token."}</p>
            <Link className="btn btn-primary" to="/menu">
              Back to Menu
            </Link>
          </div>
        </main>
      </>
    );
  }

  const s = order.status;
  const cls = s === "Ready" ? "status-ready" : s === "Cooking" ? "status-cooking" : s === "Completed" ? "status-completed" : s === "Cancelled" ? "status-cancelled" : "status-preparing";
  const icon = s === "Ready" ? "✅" : s === "Cooking" ? "🍳" : s === "Completed" ? "✨" : s === "Cancelled" ? "❌" : "⏳";

  return (
    <>
      <Navbar />

      <main className="page" style={{ display: "grid", placeItems: "center", padding: "40px 20px" }}>
        <div className="token-card" data-testid="token-card">
          <div style={{ color: "var(--muted)", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase", fontSize: "11px" }}>
            Your Token
          </div>
          <div className="token-num" data-testid="token-num">
            {order.tokenNumber}
          </div>
          <div style={{ color: "var(--brown-soft)", fontSize: "13px", marginBottom: "12px" }}>
            {order.userName} • {order.rollNumber} • {order.department}
          </div>
          <div style={{ margin: "14px 0" }}>
            <span className={`status-pill ${cls}`} data-testid="status-pill">
              {icon} {s}
            </span>
          </div>
          
          <div style={{ textAlign: "left", marginTop: "18px", borderTop: "1px dashed var(--border)", paddingTop: "12px" }}>
            {order.items.map((i, idx) => (
              <div className="summary-item" key={idx}>
                <span>
                  {i.name} <span style={{ color: "var(--muted)" }}>× {i.qty}</span>
                </span>
                <span>₹{i.price * i.qty}</span>
              </div>
            ))}
            <div className="summary-item" style={{ fontWeight: "800", fontSize: "15px", borderBottom: "none", marginTop: "10px" }}>
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="summary-item" style={{ borderBottom: "none" }}>
              <span>Slot</span>
              <span>{order.slot ? order.slot.split("—")[0].trim() : ""}</span>
            </div>
            <div className="summary-item" style={{ borderBottom: "none" }}>
              <span>Payment</span>
              <span>{order.paymentMethod ? order.paymentMethod.toUpperCase() : ""}</span>
            </div>
            <div className="summary-item" style={{ borderBottom: "none" }}>
              <span>Payment Status</span>
              <span style={{ color: order.isPaid ? "var(--success)" : "var(--danger)", fontWeight: "bold" }}>
                {order.isPaid ? "PAID ✓" : "UNPAID ✗"}
              </span>
            </div>
          </div>
          
          <div className="warn" style={{ marginTop: "16px", fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>
            Show this token at the counter. No cancellation after payment.
          </div>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-ghost btn-sm" to="/menu" data-testid="back-menu">
              🍽️ Menu
            </Link>
            <Link className="btn btn-primary btn-sm" to="/orders" data-testid="my-orders-link">
              📋 My Orders
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default Token;