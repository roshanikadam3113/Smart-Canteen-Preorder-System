import { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import logo from "../assets/logo.png";

export function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cartCount = getCartCount();

  return (
    <header className="topbar">
      <div className="topbar-container">
        <Link className="brand" to={isAdmin ? "/admin" : "/menu"}>
          <img src={logo} alt="DYPCET Logo" className="brand-logo" />
          DYPCET Canteen
        </Link>
        
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          ☰
        </button>
        
        <div className={`nav ${mobileOpen ? "open" : ""}`} id="main-nav">
          {(!isAuthenticated || user.role === "student") && (
            <>
              <Link 
                to="/menu" 
                className={currentPath === "/menu" ? "active" : ""} 
                data-testid="nav-menu"
              >
                🍽️ Menu
              </Link>
              <Link 
                to="/orders" 
                className={currentPath === "/orders" ? "active" : ""} 
                data-testid="nav-orders"
              >
                📋 My Orders
              </Link>
              <Link 
                to="/cart" 
                className={currentPath === "/cart" ? "active" : ""} 
                data-testid="nav-cart"
              >
                🛒 Cart{" "}
                {cartCount > 0 && (
                  <span id="cart-count" className="cart-badge">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}
          
          {isAuthenticated && isAdmin && (
            <>
              <Link 
                to="/admin" 
                className={currentPath === "/admin" ? "active" : ""} 
                data-testid="nav-admin"
              >
                👨‍🍳 Dashboard
              </Link>
              <Link 
                to="/admin/foods" 
                className={currentPath === "/admin/foods" ? "active" : ""} 
                data-testid="nav-admin-foods"
              >
                🍔 Manage Foods
              </Link>
              <Link 
                to="/admin/orders" 
                className={currentPath === "/admin/orders" ? "active" : ""} 
                data-testid="nav-admin-orders"
              >
                📋 Manage Orders
              </Link>
            </>
          )}
          
          {isAuthenticated ? (
            <>
              <span className="user-chip" data-testid="user-chip">
                👤 {user.name ? user.name.split(" ")[0] : "User"}
              </span>
              <button 
                className="btn btn-sm btn-ghost logout-btn" 
                id="logout-btn" 
                data-testid="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary" style={{ color: "#fff" }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
