import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart } = useContext(CartContext);

  const totalPrice = cart.reduce(
    (total, food) => total + food.price,
    0
  );

  return (
    <div>
      <h1>Cart Page</h1>

      <h2>Total Items: {cart.length}</h2>

      <h2>Total Price: ₹{totalPrice}</h2>
       
       <Link to="/billing">
  <button>
    Proceed To Billing
  </button>
</Link>
      {cart.map((food, index) => (
        <div key={index}>
          <h3>{food.name}</h3>
          <p>Price: ₹{food.price}</p>
          <p>Category: {food.category}</p>

          <button
            onClick={() => removeFromCart(index)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default Cart;