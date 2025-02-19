import React, { useState, useEffect } from "react";
import { fetchMenuItems, fetchOrders, createOrder } from "./api";

function Waiter() {

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
      <h3>Orders for Waiters:</h3>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className="order-summary-item">
            <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
          </div>
        ))
      ) : (
        <p>No orders available.</p>)}
        <button onClick={() => cancelOrder()} className="waiter-order-btn">Cancel Top Order</button>
        <button onClick={() => progressOrder()} className="waiter-order-btn">Progress Top Order</button>
    </div>
  );

}

export default Waiter;


