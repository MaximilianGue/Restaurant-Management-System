import React, { useState, useEffect } from "react";
import { fetchOrders } from "./api";
import { useNavigate } from "react-router-dom";

function Kitchen({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  // Automatically refresh orders every 5 seconds
      useEffect(() => {
        loadOrders();
    
        const interval = setInterval(() => {
          loadOrders();
        }, 5000);
    
        return () => clearInterval(interval); // Cleanup interval on unmount
      }, []);

  const loadOrders = async () => {
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="order-list">
      <button className="return-button" onClick={() => { 
        setRole(0); // Reset role to customer
        navigate("/"); 
      }}>
        Return to Customer View
      </button>

      <h3>Orders for Kitchen Staff:</h3>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="order-summary-item">
            <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
          </div>
        ))
      ) : (
        <p>No orders available.</p>
      )}

      {showPopup && (
        <div className="custom-popup">
          <p>{errorMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default function Kitchens() {
  return (
    <div>
      <Kitchen
        orders={new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
          ['key3', 'value3']])}
      />
    </div>
  )
};