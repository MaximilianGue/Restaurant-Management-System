import React, { useState, useEffect } from "react";
import { fetchOrders, updateOrderStatus } from "./api";
import { useNavigate } from "react-router-dom";
import "./kitchen.css";

function Kitchen() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const statusOptions = [
    "pending",
    "confirmed",
    "being prepared",
    "canceled",
    "ready for pick up",
    "delivered",
    "paid for",
  ];

  // Fetch orders and refresh every 5 seconds
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  // Handle Status Change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const staffId = "X1"; // Replace this with actual staff ID if needed
      const updatedStatus = await updateOrderStatus(orderId, newStatus, staffId);
  
      if (updatedStatus === newStatus) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setErrorMessage("Status successfully updated!");
      } else {
        setErrorMessage("Failed to update order status.");
      }
    } catch (error) {
      setErrorMessage("Error updating status. Please try again.");
    }
  
    setShowPopup(true);
    await loadOrders(); // Refresh orders after status update
  };
  

  // Separate orders into two categories
  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "being prepared"].includes(order.status)
  );

  const completedOrders = orders.filter((order) =>
    ["canceled", "ready for pick Up", "delivered", "paid for"].includes(order.status)
  );

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
                <th>Order #</th>
                <th>Total (£)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No active orders</td>
                </tr>
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
                <th>Order #</th>
                <th>Total (£)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No completed orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
