import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import api, { API_BASE_URL } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function MyOrders() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const getOrders = async () => {
      try {
        const response = await api.get(`/orders?email=${user.email}`);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    getOrders();

    // Establish WebSocket connection
    const socket = io(API_BASE_URL);

    // Join room when connected
    socket.on("connect", () => {
      if (user.email) {
        socket.emit("join", user.email);
      }
    });

    // Listen for order status updates
    socket.on("order_updated", (updatedOrder) => {
      if (updatedOrder) {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const formatTime = (iso) => {
    const d = new Date(iso);
    return `Placed ${d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="page-head" style={{ marginBottom: "20px" }}>
          <div>
            <h1>My Orders</h1>
            <p>Track your active preorders and view your order history.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            No orders found. <Link to="/menu" style={{ color: "var(--orange)", fontWeight: 700 }}>Go to menu</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((o) => {
              const isReady = o.status === "Ready";
              const isCompleted = o.status === "Completed";
              const isCancelled = o.status === "Cancelled";
              
              const icon = isReady ? "✅" : o.status === "Cooking" ? "🍳" : isCompleted ? "✨" : isCancelled ? "❌" : "⏳";
              const cls = isReady ? "status-ready" : o.status === "Cooking" ? "status-cooking" : isCompleted ? "status-completed" : isCancelled ? "status-cancelled" : "status-preparing";
              
              const itemsText = o.items.map((i) => `${i.name} × ${i.qty}`).join(", ");

              return (
                <div
                  key={o._id}
                  style={{
                    background: "var(--bg-elev)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "16px",
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                    boxShadow: "var(--shadow)",
                    animation: "fadeUp 0.35s ease",
                  }}
                >
                  <div
                    style={{
                      background: "var(--cream)",
                      color: "var(--orange)",
                      fontWeight: 800,
                      fontFamily: "'Fraunces', serif",
                      fontSize: "24px",
                      padding: "20px",
                      borderRadius: "12px",
                      letterSpacing: "-1px",
                      minWidth: "100px",
                      textAlign: "center",
                    }}
                  >
                    {o.tokenNumber}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "var(--brown)" }}>
                      {itemsText}
                    </h3>
                    <div style={{ fontSize: "13px", color: "var(--brown-soft)", marginBottom: "4px" }}>
                      {o.slot ? o.slot.split("—")[0].trim() : ""} • {o.isPaid ? `Paid via ${o.paymentMethod.toUpperCase()}` : `Unpaid (${o.paymentMethod.toUpperCase()})`}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {formatTime(o.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                    <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--brown)" }}>
                      ₹{o.totalAmount}
                    </div>
                    <div className={`status-pill ${cls}`} style={{ fontSize: "12px", padding: "4px 10px" }}>
                      {icon} {o.status}
                    </div>
                    <Link
                      to={`/token?t=${o.tokenNumber}`}
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        padding: "6px 14px",
                        border: "1.5px solid var(--border)",
                        borderRadius: "999px",
                        color: "var(--brown-soft)",
                        textDecoration: "none",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--cream)")}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                    >
                      View token
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default MyOrders;