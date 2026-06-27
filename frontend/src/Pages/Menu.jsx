/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";
import Navbar from "../components/Navbar";
import "../style/Menu.css";

function Menu() {
  const { cart, addToCart } = useContext(CartContext);
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [toast, setToast] = useState({ show: false, message: "" });

  const categories = [
    "All",
    "All Time Favorites",
    "Pizza & Burger",
    "Fries / Nuggets / Momos",
    "Hot Beverages / Tea",
    "Chinese",
    "Thali",
  ];

  const getFoods = async () => {
    try {
      const response = await axios.get("http://localhost:5000/foods");
      setFoods(response.data);
    } catch (error) {
      console.error("Error fetching foods:", error);
    }
  };

  const filterFoods = () => {
    let data = [...foods];

    if (activeCategory !== "All") {
      data = data.filter((food) => food.category === activeCategory);
    }

    if (search.trim() !== "") {
      data = data.filter((food) =>
        food.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredFoods(data);
  };

  useEffect(() => {
    getFoods();
  }, []);

  useEffect(() => {
    filterFoods();
  }, [foods, search, activeCategory]);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2200);
  };

  const handleAddToCart = (food) => {
    const wasInCart = cart.find((x) => x._id === food._id);
    const added = addToCart(food);
    if (added !== false) {
      showToast(
        wasInCart
          ? `${food.name} qty updated (${wasInCart.qty + 1}) 🛒`
          : `${food.name} added to cart ✓`
      );
    } else {
      showToast("Item is out of stock");
    }
  };

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="page-head">
          <div>
            <h1>What's cooking today?</h1>
            <p>Preorder your meal. Pick it up from the counter with just a token.</p>
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="search-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search for biryani, momos, chai..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ================= CATEGORY TABS ================= */}
        <div className="tabs" id="tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "tab active" : "tab"}
              onClick={() => setActiveCategory(category)}
              data-testid={`tab-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* ================= MENU GRID ================= */}
        <div className="menu-grid" id="menu-grid">
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food) => {
              const inCart = cart.find((x) => x._id === food._id);
              return (
                <div
                  className="menu-card"
                  key={food._id}
                  data-testid={`menu-item-${food._id}`}
                >
                  <div
                    className="thumb"
                    style={{
                      backgroundImage: `url('http://localhost:5000/uploads/foods/${food.image}')`,
                    }}
                    aria-label={food.name}
                  >
                    <span style={{ opacity: 0 }}>🍛</span>
                  </div>
                  <div className="body">
                    <span className="cat-chip">{food.category}</span>
                    <h3>{food.name}</h3>
                    <div className="foot">
                      <span className="price">{food.price}</span>
                      {food.inStock === false ? (
                        <span
                          style={{
                            color: "var(--danger)",
                            fontWeight: 700,
                            fontSize: "13px",
                            background: "#fde2e2",
                            padding: "4px 10px",
                            borderRadius: "999px",
                          }}
                        >
                          Out of Stock
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAddToCart(food)}
                          style={{ position: "relative" }}
                          data-add={food._id}
                          data-testid={`add-${food._id}`}
                        >
                          Add +
                          {inCart && (
                            <span
                              style={{
                                position: "absolute",
                                top: "-6px",
                                right: "-6px",
                                background: "#fff",
                                color: "var(--orange)",
                                border: "1.5px solid var(--orange)",
                                borderRadius: "999px",
                                fontSize: "10px",
                                fontWeight: 800,
                                padding: "1px 5px",
                                lineHeight: 1.4,
                              }}
                            >
                              {inCart.qty}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">No items match your search.</div>
          )}
        </div>
      </main>

      {/* ================= TOAST NOTIFICATION ================= */}
      <div className={`toast ${toast.show ? "show" : ""}`} id="toast">
        {toast.message}
      </div>
    </>
  );
}

export default Menu;