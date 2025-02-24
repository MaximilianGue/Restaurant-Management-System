import React, { useState, useEffect } from "react";
import { fetchOrders } from "./api";
import { useNavigate } from "react-router-dom";
import "./kitchen.css";

function Kitchen() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await fetchOrders();
      setOrders(ordersData || []);
    } catch (error) {
      setErrorMessage("Failed to load orders.");
      setShowPopup(true);
    }
  };

  const activeOrders = orders.filter(order => order.status !== "Completed");
  const completedOrders = orders.filter(order => order.status === "Completed");

  return (
    <div className="kitchen-container">
      <button className="return-button" onClick={() => navigate("/")}>
        Return to Customer View
      </button>

      <div className="order-tables">
        {/* Active Orders Table */}
        <div className="order-table">
          <h3>Active Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total (£)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.length > 0 ? (
                activeOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>{order.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No active orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Completed Orders Table */}
        <div className="order-table">
          <h3>Completed Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total (£)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders.length > 0 ? (
                completedOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>{order.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No completed orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Popup */}
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
