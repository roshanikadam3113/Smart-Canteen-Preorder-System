import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import campus from "../assets/campus.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
   
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        formData
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );

      if (response.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/menu");
      }
    } catch (error) {
      console.log(error);
      setError("Invalid Email or Password");
    }
  };

  return (
   <main className="auth-wrap">
  <section
    className="auth-card auth-card-sm"
    data-testid="login-card"
  >
    <div className="brand">
      <img
        src={logo}
        alt="DYP Logo"
        className="brand-logo"
      />
      DYPCET Canteen
    </div>

    <h1>Welcome back</h1>

    <p className="sub">
      Sign in to place orders and track your meals.
    </p>

    {error && (
      <div className="alert error">
        {error}
      </div>
    )}

    <form
      onSubmit={handleSubmit}
      autoComplete="on"
    >
      <div className="field">
        <label htmlFor="li-email">
          Email Address
        </label>

        <input
          id="li-email"
          type="email"
          name="email"
          placeholder="you@college.in"
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="li-password">
          Password
        </label>

        <div className="pw-wrap">
          <input
            id="li-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            className="pw-eye"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <FaEyeSlash />
            ) : (
              <FaEye />
            )}
          </button>
        </div>
      </div>

      <button
        className="btn btn-primary btn-block login-btn"
        type="submit"
      >
        Login →
      </button>
    </form>

    <div className="switch-link">
      New here?{" "}
      <Link to="/register">
        Create an account
      </Link>
    </div>
  </section>
</main>
  );
}

export default Login;