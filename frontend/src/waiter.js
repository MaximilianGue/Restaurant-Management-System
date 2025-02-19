import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "./api";

function Waiter() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
      const loadData = async () => {
        const ordersData = await fetchOrders();
        setOrders(ordersData || []);
      };
      loadData();
    }, []);

  const cancelOrder = () => {

  };

  const progressOrder = () => {

  };
  // Use capitalized name and pass 'orders' as a prop
  return (
    <div className="order-list">
      <button className="return-button" onClick={() => navigate("/")}>Return to Customer View</button>
      <h3>Orders for Waiters:</h3>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className="order-summary-item">
            <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
            <button onClick={() => cancelOrder()} className="waiter-order-btn">Cancel Order</button>
            <button onClick={() => progressOrder()} className="waiter-order-btn">Progress Order</button>
          </div>
        ))
      ) : (
        <p>No orders available.</p>)}
    </div>
  );

}

export default Waiter;


