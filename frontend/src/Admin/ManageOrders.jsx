/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import api, { API_BASE_URL } from "../utils/api";
import io from "socket.io-client";
import Navbar from "../components/Navbar";
import "./Admin.css";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotFilter, setSlotFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const TIME_SLOTS = [
    { id: "short", label: "Short Break" },
    { id: "lunch", label: "Lunch Break" },
  ];

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  useEffect(() => {
    fetchOrders();

    // Connect to WebSocket server
    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      // Join the admin room
      socket.emit("join", "admin");
      console.log("Admin socket client connected and joined admin room");
    });

    // Listen for new orders placed by students
    socket.on("new_order_placed", (newOrder) => {
      setOrders((prev) => {
        // Prevent duplicate entries
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });
      showToast(`New Order #${newOrder.tokenNumber} received!`);
    });

    // Listen for status changes
    socket.on("order_updated", (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    });

    return () => {
      socket.disconnect();
    };
  }, []);



  const handleAdvanceStatus = async (orderId, currentStatus, tokenNum) => {
    let nextStatus = "Cooking";
    if (currentStatus === "Preparing") nextStatus = "Cooking";
    else if (currentStatus === "Cooking") nextStatus = "Ready";
    else if (currentStatus === "Ready") nextStatus = "Completed";

    try {
      const response = await api.put(`/orders/${orderId}`, {
        status: nextStatus,
      });

      // Update state local list
      setOrders(orders.map((o) => (o._id === orderId ? response.data : o)));
      showToast(`#${tokenNum} advanced to ${nextStatus} status`);
    } catch (err) {
      console.error(err);
      alert("Failed to advance order status.");
    }
  };

  const handleArchiveOrders = async () => {
    if (!window.confirm('Archive all "Ready" orders? This marks them Completed and clears them from active Kanban.')) return;

    try {
      const response = await api.post("/orders/archive");
      showToast(`Archived ${response.data.count} ready orders.`);
      fetchOrders(); // Refresh lists
    } catch (err) {
      console.error(err);
      alert("Failed to archive orders.");
    }
  };

  // Helper: map slot values in DB (like "Short Break — 11:00 to 11:15") to ID ("short" or "lunch")
  const getSlotId = (slotLabel) => {
    if (!slotLabel) return "unknown";
    if (slotLabel.toLowerCase().includes("short")) return "short";
    if (slotLabel.toLowerCase().includes("lunch")) return "lunch";
    return "unknown";
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const sId = getSlotId(o.slot);
    const matchSlot = slotFilter === "all" || sId === slotFilter;
    const matchSearch =
      !search ||
      o.tokenNumber.toLowerCase().includes(search.toLowerCase().trim()) ||
      o.userName.toLowerCase().includes(search.toLowerCase().trim()) ||
      o.rollNumber.toLowerCase().includes(search.toLowerCase().trim());
    return matchSlot && matchSearch;
  });

  // Columns for Kanban Board (we only show active Preparing, Cooking, Ready)
  const preparingCards = filteredOrders.filter((o) => o.status === "Preparing");
  const cookingCards = filteredOrders.filter((o) => o.status === "Cooking");
  const readyCards = filteredOrders.filter((o) => o.status === "Ready");

  // Stats Counters
  const totalOrders = orders.length;
  const activeCount = orders.filter((o) => o.status === "Preparing" || o.status === "Cooking").length;
  const revenueTotal = orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1>Live Kitchen Order Pipeline</h1>
              <p>Manage customer orders in real-time, cook, package, and coordinate pickup collections.</p>
            </div>
            <button className="btn btn-primary" onClick={handleArchiveOrders} data-testid="archive-btn">
              Archive "Ready" Orders 📥
            </button>
          </div>

          {/* Stats Bar */}
          <div className="stats-grid" style={{ marginBottom: "28px" }}>
            <div className="stat-card" style={{ minWidth: "160px", padding: "16px 20px" }}>
              <div className="stat-title" style={{ fontSize: "11px", marginBottom: "4px" }}>Total Orders</div>
              <div className="stat-value" style={{ fontSize: "28px" }} id="stat-total">{totalOrders}</div>
            </div>
            <div className="stat-card" style={{ minWidth: "160px", padding: "16px 20px" }}>
              <div className="stat-title" style={{ fontSize: "11px", marginBottom: "4px" }}>In Progress</div>
              <div className="stat-value" style={{ fontSize: "28px", color: "#faa307" }} id="stat-progress">{activeCount}</div>
            </div>
            <div className="stat-card" style={{ minWidth: "160px", padding: "16px 20px" }}>
              <div className="stat-title" style={{ fontSize: "11px", marginBottom: "4px" }}>Ready Counter</div>
              <div className="stat-value" style={{ fontSize: "28px", color: "var(--success)" }} id="stat-ready">{readyCards.length}</div>
            </div>
            <div className="stat-card" style={{ minWidth: "160px", padding: "16px 20px" }}>
              <div className="stat-title" style={{ fontSize: "11px", marginBottom: "4px" }}>Total Revenue</div>
              <div className="stat-value" style={{ fontSize: "28px", color: "#0050b3" }} id="stat-revenue">₹{revenueTotal}</div>
            </div>
          </div>

          {/* Toolbar Filters */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <input
                id="admin-search"
                type="text"
                placeholder="Search token, student name, roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="admin-filter">
              <select
                id="slot-filter"
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value)}
              >
                <option value="all">All Break Slots</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>Loading kitchen pipelines...</div>
          ) : (
            /* Kanban Board Layout */
            <div className="kanban-board" data-testid="kanban-board">
              
              {/* Column 1: Preparing */}
              <div className="kanban-col">
                <div className="kanban-col-header preparing-header">
                  <span className="kanban-icon">⏳</span>
                  <span>Preparing</span>
                  <span className="kanban-count">{preparingCards.length}</span>
                </div>
                <div className="kanban-cards">
                  {preparingCards.length === 0 ? (
                    <div className="kanban-empty">No orders preparing.</div>
                  ) : (
                    preparingCards.map((o) => (
                      <div className="kanban-card" key={o._id} data-testid={`admin-card-${o.tokenNumber}`}>
                        <div className="kanban-card-token">{o.tokenNumber}</div>
                        <div className="kanban-card-name">{o.userName}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", margin: "2px 0 6px" }}>
                          Roll: {o.rollNumber} • {o.department}
                        </div>
                        <div className="kanban-card-items">
                          {o.items.map((i, idx) => (
                            <div key={idx}>
                              • {i.name} × {i.qty}
                            </div>
                          ))}
                        </div>
                        <div className="kanban-card-meta">
                          <span className="kanban-meta-chip">₹{o.totalAmount}</span>
                          <span className="kanban-meta-chip">{o.slot ? o.slot.split("—")[0].trim() : ""}</span>
                          <span className="kanban-meta-chip" style={{ background: o.isPaid ? "#d9f1e4" : "#fde2e2", color: o.isPaid ? "#1f5137" : "#d62828" }}>
                            {o.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="kanban-card-action">
                          <button
                            className="kanban-advance-btn"
                            onClick={() => handleAdvanceStatus(o._id, o.status, o.tokenNumber)}
                            data-testid={`advance-${o.tokenNumber}`}
                          >
                            🍳 Start Cooking
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: Cooking */}
              <div className="kanban-col">
                <div className="kanban-col-header cooking-header">
                  <span className="kanban-icon">🍳</span>
                  <span>Cooking</span>
                  <span className="kanban-count">{cookingCards.length}</span>
                </div>
                <div className="kanban-cards">
                  {cookingCards.length === 0 ? (
                    <div className="kanban-empty">No orders cooking.</div>
                  ) : (
                    cookingCards.map((o) => (
                      <div className="kanban-card" key={o._id} data-testid={`admin-card-${o.tokenNumber}`}>
                        <div className="kanban-card-token">{o.tokenNumber}</div>
                        <div className="kanban-card-name">{o.userName}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", margin: "2px 0 6px" }}>
                          Roll: {o.rollNumber} • {o.department}
                        </div>
                        <div className="kanban-card-items">
                          {o.items.map((i, idx) => (
                            <div key={idx}>
                              • {i.name} × {i.qty}
                            </div>
                          ))}
                        </div>
                        <div className="kanban-card-meta">
                          <span className="kanban-meta-chip">₹{o.totalAmount}</span>
                          <span className="kanban-meta-chip">{o.slot ? o.slot.split("—")[0].trim() : ""}</span>
                          <span className="kanban-meta-chip" style={{ background: o.isPaid ? "#d9f1e4" : "#fde2e2", color: o.isPaid ? "#1f5137" : "#d62828" }}>
                            {o.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="kanban-card-action">
                          <button
                            className="kanban-advance-btn"
                            onClick={() => handleAdvanceStatus(o._id, o.status, o.tokenNumber)}
                            data-testid={`advance-${o.tokenNumber}`}
                          >
                            🔔 Mark Ready
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Ready */}
              <div className="kanban-col">
                <div className="kanban-col-header ready-header">
                  <span className="kanban-icon">✅</span>
                  <span>Ready for Pickup</span>
                  <span className="kanban-count">{readyCards.length}</span>
                </div>
                <div className="kanban-cards">
                  {readyCards.length === 0 ? (
                    <div className="kanban-empty">No orders ready.</div>
                  ) : (
                    readyCards.map((o) => (
                      <div className="kanban-card" key={o._id} data-testid={`admin-card-${o.tokenNumber}`}>
                        <div className="kanban-card-token" style={{ color: "var(--success)" }}>{o.tokenNumber}</div>
                        <div className="kanban-card-name">{o.userName}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)", margin: "2px 0 6px" }}>
                          Roll: {o.rollNumber} • {o.department}
                        </div>
                        <div className="kanban-card-items">
                          {o.items.map((i, idx) => (
                            <div key={idx}>
                              • {i.name} × {i.qty}
                            </div>
                          ))}
                        </div>
                        <div className="kanban-card-meta">
                          <span className="kanban-meta-chip">₹{o.totalAmount}</span>
                          <span className="kanban-meta-chip">{o.slot ? o.slot.split("—")[0].trim() : ""}</span>
                          <span className="kanban-meta-chip" style={{ background: o.isPaid ? "#d9f1e4" : "#fde2e2", color: o.isPaid ? "#1f5137" : "#d62828" }}>
                            {o.isPaid ? "Paid" : "Unpaid"}
                          </span>
                        </div>
                        <div className="kanban-card-action">
                          <button
                            className="kanban-advance-btn done-btn"
                            style={{ background: "#d9f1e4", color: "#1f5137", cursor: "default" }}
                            onClick={() => handleAdvanceStatus(o._id, o.status, o.tokenNumber)}
                            data-testid={`advance-${o.tokenNumber}`}
                          >
                            Done ✅
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Toast popup */}
      <div className={`toast ${toastMessage ? "show" : ""}`} id="toast">
        {toastMessage}
      </div>
    </>
  );
}

export default ManageOrders;
