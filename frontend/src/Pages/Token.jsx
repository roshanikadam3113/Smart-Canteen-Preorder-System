function Token() {
  const order = JSON.parse(
    localStorage.getItem("order")
  );

  return (
    <div>
      <h1>Order Successful 🎉</h1>

      <h2>Token Number: {order.tokenNumber}</h2>

      <h2>Status: {order.status}</h2>

      <h3>Name: {order.userName}</h3>

      <h3>Total Amount: ₹{order.totalAmount}</h3>
    </div>
  );
}

export default Token;