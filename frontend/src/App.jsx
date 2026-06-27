import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Student Pages
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Menu from "./Pages/Menu";
import Cart from "./Pages/Cart";
import Billing from "./Pages/Billing";
import Token from "./Pages/Token";
import MyOrders from "./Pages/MyOrders";

// Admin Pages
import AdminDashboard from "./Admin/Dashboard";
import ManageFoods from "./Admin/ManageFoods";
import ManageOrders from "./Admin/ManageOrders";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Routes */}
            <Route
              path="/menu"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Menu />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/token"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Token />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <MyOrders />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/foods"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageFoods />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageOrders />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;