/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaClipboardList,
  FaRupeeSign,
  FaUtensils,
  FaClock,
  FaCheckCircle,
  FaChevronRight,
  FaStoreAlt,
  FaChartPie
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import "./Admin.css";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const [ordersRes, foodsRes] = await Promise.all([
        axios.get("http://localhost:5000/orders"),
        axios.get("http://localhost:5000/foods")
      ]);
      setOrders(ordersRes.data);
      setFoods(foodsRes.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // calculations
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter((o) => o.status === "Preparing" || o.status === "Cooking").length;
  const readyOrdersCount = orders.filter((o) => o.status === "Ready").length;
  const completedOrdersCount = orders.filter((o) => o.status === "Completed").length;
  
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalFoodItems = foods.length;
  const outOfStockItems = foods.filter((f) => f.inStock === false).length;

  // Completion rate percentage
  const completionRate = totalOrdersCount > 0 
    ? Math.round((completedOrdersCount / totalOrdersCount) * 100) 
    : 0;

  // Time slot distribution
  const shortBreakOrders = orders.filter(
    (o) => o.slot && o.slot.toLowerCase().includes("short")
  ).length;
  const lunchBreakOrders = orders.filter(
    (o) => o.slot && o.slot.toLowerCase().includes("lunch")
  ).length;
  
  const shortBreakPct = totalOrdersCount > 0 ? Math.round((shortBreakOrders / totalOrdersCount) * 100) : 0;
  const lunchBreakPct = totalOrdersCount > 0 ? Math.round((lunchBreakOrders / totalOrdersCount) * 100) : 0;

  // Last 5 active or recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="admin-page">
          
          {/* Dashboard Header */}
          <div className="admin-header" style={{ marginBottom: "30px" }}>
            <div>
              <h1 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FaStoreAlt style={{ color: "var(--orange)" }} /> Canteen Command Center
              </h1>
              <p>Real-time analytics, kitchen pipelines, and food catalog manager dashboard.</p>
            </div>
            
            <button 
              className={`btn ${refreshing ? "btn-disabled" : "btn-primary"}`}
              onClick={fetchStats}
              style={{ minWidth: "140px" }}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh Stats"}
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "80px", color: "var(--brown-soft)", fontSize: "16px" }}>
              <div className="loading-spinner" style={{ marginBottom: "16px", fontSize: "32px" }}>⏳</div>
              Loading real-time command stats...
            </div>
          ) : (
            <>
              {/* Analytics Summary Cards */}
              <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
                
                {/* Revenue Card */}
                <div className="stat-card" style={{ borderLeft: "5px solid #10b981", position: "relative" }}>
                  <div style={{ position: "absolute", right: "20px", top: "20px", fontSize: "28px", color: "rgba(16, 185, 129, 0.15)" }}>
                    <FaRupeeSign />
                  </div>
                  <div className="stat-title">Total Revenue</div>
                  <div className="stat-value" style={{ color: "#059669" }}>₹{totalRevenue}</div>
                  <div className="stat-footer">Gross earnings from preorders</div>
                </div>

                {/* Active Orders Card */}
                <div className="stat-card" style={{ borderLeft: "5px solid #f59e0b", position: "relative" }}>
                  <div style={{ position: "absolute", right: "20px", top: "20px", fontSize: "28px", color: "rgba(245, 158, 11, 0.15)" }}>
                    <FaUtensils />
                  </div>
                  <div className="stat-title">Kitchen Queue</div>
                  <div className="stat-value" style={{ color: "#d97706" }}>{activeOrdersCount}</div>
                  <div className="stat-footer">Orders preparing & cooking</div>
                </div>

                {/* Ready Orders Card */}
                <div className="stat-card" style={{ borderLeft: "5px solid var(--orange)", position: "relative" }}>
                  <div style={{ position: "absolute", right: "20px", top: "20px", fontSize: "28px", color: "rgba(232, 93, 4, 0.15)" }}>
                    <FaClock />
                  </div>
                  <div className="stat-title">Ready Counter</div>
                  <div className="stat-value" style={{ color: "var(--orange)" }}>{readyOrdersCount}</div>
                  <div className="stat-footer">Waiting for student pickup</div>
                </div>

                {/* Completion Rate Card */}
                <div className="stat-card" style={{ borderLeft: "5px solid #3b82f6", position: "relative" }}>
                  <div style={{ position: "absolute", right: "20px", top: "20px", fontSize: "28px", color: "rgba(59, 130, 246, 0.15)" }}>
                    <FaCheckCircle />
                  </div>
                  <div className="stat-title">Completion Rate</div>
                  <div className="stat-value" style={{ color: "#2563eb" }}>{completionRate}%</div>
                  
                  {/* Linear Progress Bar */}
                  <div style={{ background: "#e2e8f0", height: "6px", borderRadius: "3px", marginTop: "12px", overflow: "hidden" }}>
                    <div style={{ width: `${completionRate}%`, background: "#3b82f6", height: "100%", borderRadius: "3px", transition: "width 0.5s ease" }} />
                  </div>
                </div>

              </div>

              {/* Graphical Breakdown and Stock Allocation Grid */}
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", 
                  gap: "24px",
                  marginTop: "32px"
                }}
              >
                {/* Time Slot Allocation Visualizer */}
                <div className="table-card" style={{ padding: "24px" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--brown)", fontFamily: "'Fraunces', serif", fontSize: "18px", margin: "0 0 20px" }}>
                    <FaChartPie style={{ color: "var(--gold)" }} /> Break Slot Distribution
                  </h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {/* Short Break Gauge */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        <span>Short Break (11:00 AM)</span>
                        <span style={{ color: "var(--orange)" }}>{shortBreakOrders} orders ({shortBreakPct}%)</span>
                      </div>
                      <div style={{ height: "12px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                        <div 
                          style={{ 
                            width: `${shortBreakPct}%`, 
                            background: "linear-gradient(90deg, var(--gold) 0%, var(--orange) 100%)", 
                            height: "100%", 
                            borderRadius: "999px" 
                          }} 
                        />
                      </div>
                    </div>

                    {/* Lunch Break Gauge */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                        <span>Lunch Break (1:15 PM)</span>
                        <span style={{ color: "#2563eb" }}>{lunchBreakOrders} orders ({lunchBreakPct}%)</span>
                      </div>
                      <div style={{ height: "12px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                        <div 
                          style={{ 
                            width: `${lunchBreakPct}%`, 
                            background: "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)", 
                            height: "100%", 
                            borderRadius: "999px" 
                          }} 
                        />
                      </div>
                    </div>

                  </div>

                  <div style={{ display: "flex", gap: "20px", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--muted)" }}>
                    <div>• Total Orders Logged: <b>{totalOrdersCount}</b></div>
                    <div>• Foods Catalog Size: <b>{totalFoodItems} items</b></div>
                    {outOfStockItems > 0 && (
                      <div style={{ color: "var(--danger)" }}>• Out of stock: <b>{outOfStockItems}</b></div>
                    )}
                  </div>
                </div>

                {/* Control modules panel */}
                <div 
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "16px" 
                  }}
                >
                  <Link
                    to="/admin/orders"
                    className="cta-card"
                    style={{ 
                      background: "#fff", 
                      border: "1.5px solid var(--border)", 
                      borderRadius: "22px", 
                      padding: "24px", 
                      textDecoration: "none",
                      display: "flex", 
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--orange)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div>
                      <span style={{ fontSize: "36px" }}>🍳</span>
                      <h4 style={{ color: "var(--brown)", fontSize: "16px", margin: "12px 0 6px" }}>Live Pipeline</h4>
                      <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                        Manage live preorders inside the Cooking and Ready pipeline cols.
                      </p>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "var(--orange)", marginTop: "14px" }}>
                      Open Board <FaChevronRight />
                    </span>
                  </Link>

                  <Link
                    to="/admin/foods"
                    className="cta-card"
                    style={{ 
                      background: "#fff", 
                      border: "1.5px solid var(--border)", 
                      borderRadius: "22px", 
                      padding: "24px", 
                      textDecoration: "none",
                      display: "flex", 
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--orange)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div>
                      <span style={{ fontSize: "36px" }}>🍔</span>
                      <h4 style={{ color: "var(--brown)", fontSize: "16px", margin: "12px 0 6px" }}>Menu Catalog</h4>
                      <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>
                        Add dishes, manage stock levels, and customize item pricing.
                      </p>
                    </div>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700", color: "var(--orange)", marginTop: "14px" }}>
                      Manage Foods <FaChevronRight />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Recent Orders List Widget */}
              <div className="table-card" style={{ marginTop: "32px" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--brown)", fontFamily: "'Fraunces', serif", fontSize: "18px", margin: 0 }}>
                    <FaClipboardList style={{ color: "var(--orange)" }} /> Recent Preorder Activity
                  </h3>
                  <Link to="/admin/orders" style={{ fontSize: "13px", fontWeight: "700", color: "var(--orange)" }}>
                    View All Live Pipeline &rarr;
                  </Link>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Student Name</th>
                        <th>Slot</th>
                        <th>Amount</th>
                        <th>Items Count</th>
                        <th>Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        let statusColor = "var(--danger)";
                        if (order.status === "Preparing") statusColor = "#faa307";
                        else if (order.status === "Cooking") statusColor = "#2563eb";
                        else if (order.status === "Ready") statusColor = "#10b981";
                        else if (order.status === "Completed") statusColor = "#4b5563";

                        return (
                          <tr key={order._id}>
                            <td>
                              <b style={{ color: "var(--orange)" }}>{order.tokenNumber}</b>
                            </td>
                            <td>
                              <div>
                                <b>{order.userName}</b>
                                <div style={{ fontSize: "11px", color: "var(--muted)" }}>{order.rollNumber} • {order.department}</div>
                              </div>
                            </td>
                            <td>{order.slot ? order.slot.split("—")[0].trim() : "—"}</td>
                            <td>
                              <span style={{ fontWeight: "700", color: "var(--brown)" }}>₹{order.totalAmount}</span>
                            </td>
                            <td>{order.items.reduce((sum, item) => sum + item.qty, 0)} items</td>
                            <td>
                              <span 
                                style={{ 
                                  display: "inline-block",
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  fontSize: "11px",
                                  fontWeight: "800",
                                  textTransform: "uppercase",
                                  background: statusColor + "1a",
                                  color: statusColor,
                                  border: `1px solid ${statusColor}40`
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default Dashboard;
