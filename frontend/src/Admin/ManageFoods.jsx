/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Admin.css";

function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image: null,
  });

  const [toastMessage, setToastMessage] = useState("");

  const categories = [
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFoods();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleEditClick = (food) => {
    setEditingId(food._id);
    setFormData({
      name: food.name,
      price: food.price.toString(),
      category: food.category,
      description: food.description,
      image: null, // Only supply if replacing
    });
    // Scroll to form smoothly
    const formElement = document.getElementById("food-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      image: null,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      alert("Name, price, and category are required.");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("description", formData.description || "");
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      if (editingId) {
        // Edit existing food
        const response = await axios.put(`http://localhost:5000/foods/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(`${formData.name} updated successfully!`);
        setFoods(foods.map((f) => (f._id === editingId ? response.data : f)));
      } else {
        // Add new food
        if (!formData.image) {
          alert("Food image file is required.");
          return;
        }
        const response = await axios.post("http://localhost:5000/foods", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast(`${formData.name} added successfully!`);
        setFoods([...foods, response.data]);
      }
      handleCancelEdit();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save food item.");
    }
  };

  const handleToggleStock = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/foods/${id}/toggle-stock`);
      const updatedItem = response.data;
      setFoods(foods.map((f) => (f._id === id ? updatedItem : f)));
      showToast(`${updatedItem.name} is now ${updatedItem.inStock ? "In Stock" : "Out of Stock"}`);
    } catch (err) {
      console.error(err);
      alert("Failed to toggle stock status.");
    }
  };

  const handleDeleteClick = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await axios.delete(`http://localhost:5000/foods/${id}`);
      setFoods(foods.filter((f) => f._id !== id));
      showToast(`${name} deleted successfully.`);
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete food item.");
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase().trim());
    return matchCat && matchSearch;
  });

  return (
    <>
      <Navbar />

      <main className="page">
        <div className="admin-page">
          <div className="admin-header">
            <div>
              <h1>Manage Canteen Food Catalog</h1>
              <p>Add new foods, update pricing, toggle in-stock status, and manage the menu list.</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            
            {/* Form Section */}
            <div className="food-form" id="food-form">
              <h2>{editingId ? "✍️ Edit Food Item" : "🍔 Add New Food Item"}</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="food-name">Food Name</label>
                    <input
                      id="food-name"
                      name="name"
                      type="text"
                      placeholder="e.g. Schezwan Noodles"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="food-price">Price (₹)</label>
                    <input
                      id="food-price"
                      name="price"
                      type="number"
                      placeholder="e.g. 90"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="food-cat">Category</label>
                    <select
                      id="food-cat"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="food-file">Food Image</label>
                    <input
                      id="food-file"
                      name="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required={!editingId} // Image is optional during editing
                    />
                  </div>

                  <div className="form-group full">
                    <label htmlFor="food-desc">Description</label>
                    <textarea
                      id="food-desc"
                      name="description"
                      placeholder="Brief description of the dish..."
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingId ? "Save Changes" : "Add Food"}
                  </button>
                  {editingId && (
                    <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Catalog List Section */}
            <div className="table-card">
              <div
                style={{
                  padding: "20px 24px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <h2 style={{ fontFamily: "'Fraunces', serif", color: "var(--brown)", margin: 0 }}>
                  Active Food Menu ({foods.length} items)
                </h2>
                
                {/* Filters */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: "1px solid var(--border)",
                      fontSize: "14px",
                    }}
                  />
                  
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "999px",
                      border: "1px solid var(--border)",
                      fontSize: "14px",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>Loading food list...</div>
              ) : filteredFoods.length === 0 ? (
                <div className="empty-state" style={{ margin: "24px" }}>
                  No food items found matching your filters.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Food Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock Status</th>
                        <th>In Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFoods.map((food) => {
                        const inStockClass = food.inStock ? "in-stock" : "out-stock";
                        const inStockText = food.inStock ? "In Stock" : "Out of Stock";

                        return (
                          <tr key={food._id} data-testid={`menu-item-${food._id}`}>
                            <td>
                              <img
                                src={`http://localhost:5000/uploads/foods/${food.image}`}
                                alt={food.name}
                              />
                            </td>
                            <td>
                              <b>{food.name}</b>
                              {food.description && (
                                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                                  {food.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="cat-chip">{food.category}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: "var(--brown)" }}>₹{food.price}</span>
                            </td>
                            <td>
                              <span className={`stock-badge ${inStockClass}`}>
                                {inStockText}
                              </span>
                            </td>
                            <td>
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={food.inStock !== false}
                                  onChange={() => handleToggleStock(food._id)}
                                />
                                <span className="slider"></span>
                              </label>
                            </td>
                            <td>
                              <div className="action-group">
                                <button
                                  className="action-btn edit-btn"
                                  onClick={() => handleEditClick(food)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteClick(food._id, food.name)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Toast message */}
      <div className={`toast ${toastMessage ? "show" : ""}`} id="toast">
        {toastMessage}
      </div>
    </>
  );
}

export default ManageFoods;
