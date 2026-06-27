import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "../style/Register.css";

function Register() {
  const navigate = useNavigate();
  const { register, login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    department: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const getStrength = (pw) => {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[a-zA-Z]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    return score; // 0-5
  };

  const strength = getStrength(formData.password);
  const strengthColors = ["#e74c3c", "#e74c3c", "#f39c12", "#27ae60", "#1a8a4a", "#0d6e3b"];
  const strengthLabels = ["", "Weak", "Weak", "Medium", "Strong", "Very Strong"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password strength check (8+ characters, must contain letter, must contain number)
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!/[a-zA-Z]/.test(formData.password)) {
      setError("Password must contain at least one letter.");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // 1. Register User
      await register(
        formData.name,
        formData.roll,
        formData.department,
        formData.email,
        formData.password
      );

      // 2. Auto Login User
      await login(formData.email, formData.password);

      setSuccess("Account created! Redirecting to menu…");
      
      setTimeout(() => {
        navigate("/menu");
      }, 900);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <main className="auth-wrap">
      <section className="auth-card auth-card-sm" data-testid="register-card">
        <div className="brand" style={{ marginBottom: "10px" }}>
          <img src={logo} alt="Logo" className="brand-logo" />
          DYPCET Canteen
        </div>

        <h1 style={{ fontSize: "24px", margin: "0 0 4px" }}>Create Account</h1>
        <p className="sub" style={{ fontSize: "13px", margin: "0 0 16px" }}>
          Register to preorder meals from DYPCET Canteen.
        </p>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="field" style={{ marginBottom: "10px" }}>
            <label htmlFor="r-name">Full Name</label>
            <input
              id="r-name"
              type="text"
              name="name"
              placeholder="Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <div className="field" style={{ marginBottom: "10px" }}>
              <label htmlFor="r-roll">Roll Number</label>
              <input
                id="r-roll"
                type="text"
                name="roll"
                placeholder="22CS101"
                value={formData.roll}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field" style={{ marginBottom: "10px" }}>
              <label htmlFor="r-dept">Department</label>
              <input
                id="r-dept"
                type="text"
                name="department"
                placeholder="CSE"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: "10px" }}>
            <label htmlFor="r-email">Email Address</label>
            <input
              id="r-email"
              type="email"
              name="email"
              placeholder="you@college.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field" style={{ marginBottom: "6px" }}>
            <label htmlFor="r-password">Password</label>
            <div className="pw-wrap">
              <input
                id="r-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Min 6 chars + 1 number"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pw-eye"
                id="toggle-pw"
                onClick={() => setShowPassword(!showPassword)}
                title="Show/hide password"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="pw-strength-bar" id="pw-strength-bar">
              <div
                id="pw-strength-fill"
                style={{
                  width: `${(strength / 5) * 100}%`,
                  background: strengthColors[strength],
                }}
              ></div>
            </div>
            {formData.password && (
              <div
                id="pw-strength-label"
                style={{
                  fontSize: "11px",
                  marginTop: "2px",
                  color: strengthColors[strength],
                }}
              >
                {strengthLabels[strength]}
              </div>
            )}
          </div>

          <div className="field" style={{ marginBottom: "14px" }}>
            <label htmlFor="r-confirm">Confirm Password</label>
            <div className="pw-wrap">
              <input
                id="r-confirm"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pw-eye"
                id="toggle-confirm"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title="Show/hide password"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div
                id="confirm-msg"
                style={{
                  fontSize: "11px",
                  marginTop: "2px",
                  color: formData.password === formData.confirmPassword ? "#27ae60" : "#e74c3c",
                }}
              >
                {formData.password === formData.confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-block" type="submit">
            Create Account →
          </button>
        </form>

        <div className="switch-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </section>
    </main>
  );
}

export default Register;