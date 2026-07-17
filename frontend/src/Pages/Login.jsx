import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../style/Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState(() => {
    const hint = localStorage.getItem("hint");
    if (hint === "admin") {
      return {
        email: "admin@canteen.in",
        password: "admin123"
      };
    }
    return {
      email: "",
      password: ""
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { email, password } = formData;

  useEffect(() => {
    const hint = localStorage.getItem("hint");
    if (hint === "admin") {
      // Clear hint so standard logins start clean
      localStorage.removeItem("hint");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password);
      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/menu");
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Invalid Email or Password");
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

        <h1>Welcome Back</h1>

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

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@college.in"
              autoComplete="email"
              value={email}
              onChange={handleChange}
              required
            />

          </div>

          <div className="field">

            <label htmlFor="password">
              Password
            </label>

            <div className="pw-wrap">

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
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
                {showPassword
                  ? <FaEyeSlash />
                  : <FaEye />
                }
              </button>

            </div>

          </div>
                    <button
            type="submit"
            className="btn btn-primary btn-block login-btn"
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