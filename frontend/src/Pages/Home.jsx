import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "../style/Home.css";

function Home() {
  return (
    <div className="home-body">
      {/* ================= NAVBAR ================= */}

      <nav>
        <Link className="nav-brand" to="/">
          <img src={logo} alt="DYPCET Logo" />
          DYPCET Canteen
        </Link>

        <div className="nav-links">
          <a href="#how">How it Works</a>
          <a href="#features">Features</a>

          <Link className="nav-cta" to="/login">
            Login →
          </Link>
        </div>
      </nav>

      <main>

        {/* ================= HERO ================= */}

        <section className="hero">
          <div className="hero-content">

            <div className="hero-badge">
              🎓 Built for DYPCET Students
            </div>

            <h1>
              Smart Dining,
              <br />
              <span>Zero Waiting</span>
            </h1>

            <p>
              Preorder your meals, get a token number,
              and pick up your food without standing
              in a queue. Fast, simple, modern.
            </p>

            <div className="hero-btns">

              <Link
                className="btn-hero-primary"
                to="/register"
              >
                🍽️ Get Started
              </Link>

              <Link
                className="btn-hero-ghost"
                to="/login"
              >
                Already a member? Login
              </Link>

            </div>

          </div>
        </section>

        {/* ================= STATS ================= */}

        <div className="stats-strip">

          <div className="stat-item">
            <div className="stat-num">30+</div>
            <div className="stat-desc">Menu Items</div>
          </div>

          <div className="stat-item">
            <div className="stat-num">6</div>
            <div className="stat-desc">Food Categories</div>
          </div>

          <div className="stat-item">
            <div className="stat-num">3</div>
            <div className="stat-desc">Order Statuses</div>
          </div>

          <div className="stat-item">
            <div className="stat-num">0₹</div>
            <div className="stat-desc">Platform Fee</div>
          </div>

        </div>

        {/* ================= HOW IT WORKS ================= */}

        <section
          className="section"
          id="how"
        >

          <div className="section-tag">
            Simple Process
          </div>

          <h2 className="section-title">
            Order in 4 Easy Steps
          </h2>

          <p className="section-sub">
            No complicated process —
            just browse, add, pay,
            and pick up your food.
          </p>

          <div className="steps">

            <div className="step">
              <div className="step-num">1</div>

              <h3>Browse the Menu</h3>

              <p>
                Explore 30+ freshly prepared items
                across Burgers, Snacks,
                Meals, Rice and more.
              </p>
            </div>

            <div className="step">
              <div className="step-num">2</div>

              <h3>Add to Cart</h3>

              <p>
                Select your items,
                choose quantities
                and preferred slot.
              </p>
            </div>

            <div className="step">
              <div className="step-num">3</div>

              <h3>Pay &amp; Get Token</h3>

              <p>
                Complete your online payment
                and instantly receive your
                digital token number.
              </p>
            </div>

            <div className="step">
              <div className="step-num">4</div>

              <h3>Pick Up &amp; Enjoy</h3>

              <p>
                Show your token
                when your order is
                ready.
              </p>
            </div>

          </div>

        </section>
        {/* ================= FEATURES ================= */}

        <section
          className="features-bg"
          id="features"
        >
          <div className="features-inner">

            <div className="section-tag">
              Why Use This
            </div>

            <h2 className="section-title">
              Everything You Need
            </h2>

            <p className="section-sub">
              A complete canteen management
              system designed for students
              and staff alike.
            </p>

            <div className="features-grid">

              <div className="feat">
                <div className="feat-icon">⚡</div>

                <h3>Real-Time Updates</h3>

                <p>
                  Your order status updates
                  live from Preparing →
                  Cooking → Ready.
                </p>
              </div>

              <div className="feat">
                <div className="feat-icon">🔐</div>

                <h3>Secure Login</h3>

                <p>
                  Students and Admin
                  have secure role-based
                  authentication.
                </p>
              </div>

              <div className="feat">
                <div className="feat-icon">🍔</div>

                <h3>Rich Menu</h3>

                <p>
                  Browse categories,
                  search foods and
                  view beautiful images.
                </p>
              </div>

              <div className="feat">
                <div className="feat-icon">🧾</div>

                <h3>Instant Digital Token</h3>

                <p>
                  Receive your token
                  immediately after
                  successful payment.
                </p>
              </div>

              <div className="feat">
                <div className="feat-icon">📦</div>

                <h3>Admin Dashboard</h3>

                <p>
                  Manage orders,
                  food stock and
                  customer requests.
                </p>
              </div>

              <div className="feat">
                <div className="feat-icon">📱</div>

                <h3>Mobile Friendly</h3>

                <p>
                  Fully responsive
                  design for phones,
                  tablets and laptops.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ================= CTA ================= */}

        <section className="cta-section">

          <h2>Ready to Skip the Queue?</h2>

          <p>
            Join your fellow students
            on DYPCET's smart canteen
            platform.
          </p>

          <div className="cta-cards">

            <Link
              className="cta-card"
              to="/register"
            >
              <div className="cta-card-icon">🎓</div>

              <h3>I'm a Student</h3>

              <p>
                Register, browse
                the menu and place
                your first order.
              </p>

              <span className="cta-card-btn">
                Register Now →
              </span>

            </Link>

            <Link
              className="cta-card"
              to="/login"
              onClick={() => localStorage.setItem("hint", "admin")}
            >
              <div className="cta-card-icon">👨‍🍳</div>

              <h3>I'm Canteen Staff</h3>

              <p>
                Login to manage
                orders, menus and
                kitchen status.
              </p>

              <span className="cta-card-btn">
                Admin Login →
              </span>

            </Link>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>

        <div>
          <strong>DYPCET Canteen</strong>
          <br />
          Smart Campus Preorder System
          <br />
          D.Y. Patil College of Engineering &amp; Technology, Kolhapur
        </div>

        <div className="footer-links">

          <Link to="/login">
            Login
          </Link>

          <Link to="/register">
            Register
          </Link>

          <Link to="/menu">
            Menu
          </Link>

        </div>

      </footer>

    </div>
  );
}

export default Home;