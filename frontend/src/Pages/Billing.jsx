import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Billing() {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const totalPrice = cart.reduce(
    (total, food) => total + food.price,
    0
  );

  const placeOrder = async () => {
    try {
      const orderData = {
        userName: user.name,
        rollNumber: user.roll,

        items: cart,

        totalAmount: totalPrice,

        slot: "12:00 PM",

        paymentMethod: "Cash",

        tokenNumber: Math.floor(
          Math.random() * 1000
        ).toString(),
      };

      const response = await axios.post(
        "http://localhost:5000/orders",
        orderData
      );

      localStorage.setItem(
        "order",
        JSON.stringify(response.data)
      );

      navigate("/token");
    } catch (error) {
      console.log(error);
      alert("Failed To Place Order");
    }
  };

  return (
    <div>
      <h1>Billing Page</h1>

      <h2>Total Items: {cart.length}</h2>

      <h2>Total Amount: ₹{totalPrice}</h2>

      <h3>User Details</h3>

      <p>Name: {user.name}</p>
      <p>Roll Number: {user.roll}</p>
      <p>Department: {user.department}</p>

      {cart.map((food, index) => (
        <div key={index}>
          <h3>{food.name}</h3>
          <p>₹{food.price}</p>
        </div>
      ))}

      <button onClick={placeOrder}>
        Place Order
      </button>
    </div>
  );
}

export default Billing;