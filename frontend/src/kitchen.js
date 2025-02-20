import React, { useState, useEffect } from "react";
import { fetchOrders,fetchKitchenStaff,fetchKitchenstaffer,fetchWaiter,confirmOrder,fetchWaiters } from "./api";
import { useNavigate } from "react-router-dom";
function Kitchen() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState([]);
  const [status, setStatus] = useState([]);
  const [staffId, setStaffId] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
   const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
        const loadData = async () => {
          const ordersData = await fetchOrders();
          setOrders(ordersData || []);
        };
        loadData();
      }, []);const [menuItemId, setMenuItemId] = useState([]);

    return (
      <div className="order-list">
        <button className="return-button" onClick={() => navigate("/")}>Return to Customer View</button>
        <h3>Orders for KitchenStaff:</h3>
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div key={index} className="order-summary-item">
              <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
              <span>Status: {order.status}</span>
              
            </div>
       
          ))
        ) : (
          <p>No orders available.</p>)}
          {showPopup && (
            <div className="custom-popup">
              <p>{errorMessage}</p>
              <button onClick={() => setShowPopup(false)}>Close</button>
            </div>
          )}
      </div>
    );
  
}

export default Kitchen;
