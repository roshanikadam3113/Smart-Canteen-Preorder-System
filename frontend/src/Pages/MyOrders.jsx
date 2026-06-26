import { useEffect, useState } from "react";
import axios from "axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/orders"
      );

      setOrders(response.data);
    } catch (error) {
      console.log(error);
    }
  };

 return (
  <div>
    <h1>My Orders</h1>

    {orders.map((order) => (
      <div key={order._id}>
        <h3>Token: {order.tokenNumber}</h3>

        <p>Name: {order.userName}</p>

        <p>Total Amount: ₹{order.totalAmount}</p>

        <p>Status: {order.status}</p>
      </div>
    ))}
  </div>
);
}

export default MyOrders;