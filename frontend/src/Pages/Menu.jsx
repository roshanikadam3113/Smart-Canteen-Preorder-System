import { useState, useEffect, useContext } from "react";

import { CartContext } from "../context/CartContext.jsx";

import axios from "axios";

import { Link } from "react-router-dom";
function Menu() {
  const [foods, setFoods] = useState([]);
  const { cart, addToCart } = useContext(CartContext);

  useEffect(() => {
    getFoods();
  }, []);

  const getFoods = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/foods"
      );

      setFoods(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Menu Page</h1>
      <h2>Cart Items: {cart.length}</h2>
      {foods.map((food) => (
        <div key={food._id}>
          <h3>{food.name}</h3>
          <p>Price: ₹{food.price}</p>
          <p>Category: {food.category}</p>

          <button onClick={() => addToCart(food)}>
            Add To Cart
          </button>
        </div>
      ))}


      <Link to="/cart">
        Go To Cart
      </Link>
    </div>
  );
}

export default Menu;