import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import "../style/Billing.css";

const TIME_SLOTS = [
  {
    id: "short",
    label: "Short Break — 11:00 to 11:15",
  },
  {
    id: "lunch",
    label: "Lunch Break — 1:15 to 2:00",
  },
];

const PAYMENT_METHODS = [
  {
    id: "gpay",
    name: "Google Pay",
    shortName: "GPay",
    icon: "https://cdn.simpleicons.org/googlepay",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    shortName: "PhonePe",
    icon: "https://cdn.simpleicons.org/phonepe",
  },
  {
    id: "paytm",
    name: "Paytm",
    shortName: "Paytm",
    icon: "https://cdn.simpleicons.org/paytm",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    shortName: "BHIM",
    icon: "https://cdn.simpleicons.org/bhim",
  },
];

function Billing() {
  const navigate = useNavigate();

  const {
    cart,
    slot,
    getCartTotal,
    clearCart,
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);

  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || "",
    roll: user?.roll || "",
    department: user?.department || "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("gpay");

  const [error, setError] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] =
    useState(false);
  const [isProcessing, setIsProcessing] =
    useState(false);

  // --------------------------------------------------
  // LOAD RAZORPAY SCRIPT
  // --------------------------------------------------

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // --------------------------------------------------
  // REDIRECT IF CART EMPTY
  // --------------------------------------------------

  useEffect(() => {
    if (
      cart.length === 0 &&
      !isOrderPlaced
    ) {
      navigate("/menu");
    }
  }, [
    cart,
    navigate,
    isOrderPlaced,
  ]);

  // --------------------------------------------------
  // INPUT CHANGE
  // --------------------------------------------------

  const handleInputChange = (e) => {
    setBillingDetails({
      ...billingDetails,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // --------------------------------------------------
  // GET SLOT LABEL
  // --------------------------------------------------

  const getSlotLabel = () => {
    const selectedSlot = TIME_SLOTS.find(
      (item) => item.id === slot
    );

    return selectedSlot
      ? selectedSlot.label
      : "Not selected";
  };

  // --------------------------------------------------
  // GET PAYMENT METHOD NAME
  // --------------------------------------------------

  const getPaymentMethodName = () => {
    const method = PAYMENT_METHODS.find(
      (item) => item.id === paymentMethod
    );

    return method?.name || "UPI";
  };

  // --------------------------------------------------
  // HANDLE PAYMENT
  // --------------------------------------------------

  const handlePlaceOrder = async () => {
    const {
      name,
      roll,
      department,
    } = billingDetails;

    // Validate student details
    if (
      !name ||
      !roll ||
      !department
    ) {
      setError(
        "Please fill name, roll number and department."
      );
      return;
    }

    if (!paymentMethod) {
      setError(
        "Please select a payment method."
      );
      return;
    }

    setError("");

    const total = getCartTotal();
    const slotLabel = getSlotLabel();

    try {
      setIsProcessing(true);

      // ------------------------------------------------
      // 1. LOAD RAZORPAY
      // ------------------------------------------------

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        setError(
          "Failed to load Razorpay. Please check your internet connection."
        );

        setIsProcessing(false);
        return;
      }

      // ------------------------------------------------
      // 2. CREATE RAZORPAY ORDER
      // ------------------------------------------------

      const res = await api.post(
        "/orders/create-razorpay-order",
        {
          amount: total,
        }
      );

      // ------------------------------------------------
      // 3. RAZORPAY OPTIONS
      // ------------------------------------------------
      //
      // IMPORTANT:
      // We are NOT forcing:
      //
      // method: "upi"
      //
      // Razorpay will now open its normal checkout.
      // This allows you to test different payment
      // methods in Razorpay Test Mode.
      // ------------------------------------------------

      const options = {
        key: res.data.keyId,

        amount: res.data.amount,

        currency: res.data.currency,

        name: "Canteen Preorder System",

        description:
          `Food Preorder (${cart.length} item(s))`,

        order_id: res.data.id,

        prefill: {
          name: name,

          email:
            user?.email || "",

          contact:
            user?.phone || "",
        },

        theme: {
          color: "#e65100",
        },

        // ------------------------------------------------
        // SUCCESS
        // ------------------------------------------------

        handler: async function (response) {
          try {
            const verifyRes =
              await api.post(
                "/orders/verify-payment",
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  userName: name,

                  userEmail:
                    user?.email || "",

                  rollNumber: roll,

                  department,

                  items: cart,

                  totalAmount: total,

                  slot: slotLabel,

                  paymentMethod:
                 "RAZORPAY",
                }
              );

            // Payment verified
            setIsOrderPlaced(true);

            localStorage.setItem(
              "canteen.lastOrder",
              verifyRes.data.tokenNumber
            );

            clearCart();

            alert(
              "Payment Verified! Order Placed Successfully."
            );

            navigate(
              `/token?t=${verifyRes.data.tokenNumber}`
            );
          } catch (err) {
            console.error(
              "Payment verification failed:",
              err
            );

            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please contact support."
            );
          } finally {
            setIsProcessing(false);
          }
        },

        // ------------------------------------------------
        // MODAL CLOSED
        // ------------------------------------------------

        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      // ------------------------------------------------
      // 4. CREATE RAZORPAY INSTANCE
      // ------------------------------------------------

      const razorpay =
        new window.Razorpay(options);

      // ------------------------------------------------
      // PAYMENT FAILED
      // ------------------------------------------------

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Razorpay Payment Failed:",
            response.error
          );

          setError(
            `Payment Failed: ${
              response.error.description ||
              response.error.reason ||
              "Payment was not completed"
            }`
          );

          setIsProcessing(false);
        }
      );

      // ------------------------------------------------
      // 5. OPEN RAZORPAY
      // ------------------------------------------------

      razorpay.open();

    } catch (err) {
      console.error(
        "Razorpay order creation failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to initialize payment."
      );

      setIsProcessing(false);
    }
  };

  const total = getCartTotal();

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="billing-page">

          {/* ==========================================
              HEADER
          =========================================== */}

          <div className="billing-header">
            <h1>
              Checkout & Billing
            </h1>

            <p>
              Complete your details and select
              your payment method.
            </p>
          </div>

          {/* ERROR */}

          {error && (
            <div
              className="alert error"
              id="b-error"
              style={{
                display: "block",
              }}
            >
              {error}
            </div>
          )}

          <div className="billing-grid">

            {/* ========================================
                LEFT COLUMN
            ========================================= */}

            <div className="billing-left">

              {/* STUDENT DETAILS */}

              <div className="billing-card">

                <h2>
                  Student Details
                </h2>

                <div
                  className="field"
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  <label htmlFor="b-name">
                    Full Name
                  </label>

                  <input
                    id="b-name"
                    name="name"
                    type="text"
                    value={
                      billingDetails.name
                    }
                    onChange={
                      handleInputChange
                    }
                    required
                  />
                </div>

                <div className="row">

                  <div className="field">

                    <label htmlFor="b-roll">
                      Roll Number
                    </label>

                    <input
                      id="b-roll"
                      name="roll"
                      type="text"
                      value={
                        billingDetails.roll
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                    />

                  </div>

                  <div className="field">

                    <label htmlFor="b-dept">
                      Department
                    </label>

                    <input
                      id="b-dept"
                      name="department"
                      type="text"
                      value={
                        billingDetails.department
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                    />

                  </div>

                </div>
              </div>

              {/* =====================================
                  PAYMENT METHODS
              ====================================== */}

              <div className="payment-card">

                <div className="payment-header">

                  <div>
                    <h3>
                      Select Payment Method
                    </h3>

                    <span>
                      Choose your preferred UPI app
                    </span>
                  </div>

                </div>

                <div className="payment-options">

                  {PAYMENT_METHODS.map(
                    (method) => {

                      const isSelected =
                        paymentMethod ===
                        method.id;

                      return (
                        <button
                          key={method.id}
                          type="button"
                          className={`payment-option ${
                            isSelected
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setPaymentMethod(
                              method.id
                            )
                          }
                        >

                          <div className="payment-icon-wrapper">

                            <img
                              src={method.icon}
                              alt={
                                method.name
                              }
                              className="payment-icon-img"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";

                                e.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }}
                            />

                            <span className="payment-fallback">
                              {method.shortName
                                .charAt(0)}
                            </span>

                          </div>

                          <span className="payment-name">
                            {method.name}
                          </span>

                          {isSelected && (
                            <span className="payment-check">
                              ✓
                            </span>
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            {/* ========================================
                ORDER SUMMARY
            ========================================= */}

            <div className="billing-card order-summary-card">

              <h2>
                Order Summary
              </h2>

              {/* ITEMS */}

              <div className="summary-items">

                {cart.map(
                  (item) => (
                    <div
                      className="summary-item"
                      key={item._id}
                      data-testid={
                        `sum-${item._id}`
                      }
                    >

                      <span className="summary-name">

                        {item.name}

                        <span
                          className="summary-quantity"
                        >
                          × {item.qty}
                        </span>

                      </span>

                      <span className="summary-price">
                        ₹
                        {item.price *
                          item.qty}
                      </span>

                    </div>
                  )
                )}

              </div>

              {/* PICKUP */}

              <div className="summary-item pickup-row">

                <span>
                  Pickup Slot
                </span>

                <span
                  data-testid="sum-slot"
                >
                  {
                    getSlotLabel()
                      .split("—")[0]
                      .trim()
                  }
                </span>

              </div>

              {/* PAYMENT METHOD */}

              <div className="summary-item pickup-row">

                <span>
                  Payment Method
                </span>

                <span
                  data-testid="sum-payment-method"
                >
                  {getPaymentMethodName()}
                </span>

              </div>

              {/* TOTAL */}

              <div className="summary-total">

                <span>
                  Total Amount
                </span>

                <span
                  data-testid="sum-total"
                >
                  ₹{total}
                </span>

              </div>

              {/* PAY BUTTON */}

              <button
                className="pay-btn"
                onClick={
                  handlePlaceOrder
                }
                disabled={
                  isProcessing
                }
                data-testid="place-order-btn"
              >
                {isProcessing
                  ? "Processing..."
                  : `Pay ₹${total}`}
              </button>

            </div>

          </div>

        </div>
      </main>
    </>
  );
}

export default Billing;