import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
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

  const updateStatus = async (id, status) => {
  try {
    await axios.put(
      `http://localhost:5000/orders/${id}`,
      {
        status,
      }
    );

    getOrders();
  } catch (error) {
    console.log(error);
  }
};
  return (
    <div>
      <h1>Admin Panel</h1>

      {orders.map((order) => (
  <div key={order._id}>
    <h2>Token: {order.tokenNumber}</h2>

    <p>Name: {order.userName}</p>

    <p>Amount: ₹{order.totalAmount}</p>

    <p>Status: {order.status}</p>

    <select
  value={order.status}
  onChange={(e) =>
    updateStatus(
      order._id,
      e.target.value
    )
  }
>
      <option value="Preparing">
        Preparing
      </option>

      <option value="Ready">
        Ready
      </option>

      <option value="Completed">
        Completed
      </option>
    </select>
  </div>
))}
      

    </div>
  );
}

export default Admin;