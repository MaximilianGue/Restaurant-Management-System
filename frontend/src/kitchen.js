import React, { useState, useEffect } from "react";
import { fetchOrders, updateOrderStatus, fetchNotificationsForStaff, callWaiter } from "./api";
import { useNavigate } from "react-router-dom";
import "./kitchen.css";
import { STAFF_ID } from "./constants";

function Kitchen({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [latestNotification, setLatestNotification] = useState(null);

  const staffId = localStorage.getItem(STAFF_ID);  // Current logged-in kitchen staff ID

  const statusOptions = [
    "pending",
    "confirmed",
    "being prepared",
    "canceled",
    "ready for pick up",
    "delivered",
    "paid for",
  ];

  useEffect(() => {
    loadOrders();
    loadLatestNotification();
    const interval = setInterval(() => {
      loadOrders();
      loadLatestNotification();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  const loadLatestNotification = async () => {
    const notifications = await fetchNotificationsForStaff(staffId);
    if (notifications && notifications.length > 0) {
      setLatestNotification(notifications[0]);  // Most recent (assuming backend sorts it)
    } else {
      setLatestNotification(null);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedStatus = await updateOrderStatus(orderId, newStatus, staffId);

      if (updatedStatus === newStatus) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );

        setErrorMessage("Status successfully updated!");

        if (newStatus === "ready for pick up") {
          await notifyWaiterForReadyOrder(orderId);
        }

      } else {
        setErrorMessage("Failed to update order status.");
      }
    } catch (error) {
      setErrorMessage("Error updating status. Please try again.");
    }

    setShowPopup(true);
    await loadOrders();
  };

  const notifyWaiterForReadyOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.waiter) {
      setErrorMessage("No waiter assigned to this order.");
      setShowPopup(true);
      return;
    }

    const waiterStaffId = order.waiter.Staff_id;

    const message = `Order #${orderId} is ready for pickup.`;

    const response = await callWaiter(waiterStaffId, orderId, message, "status_change");

    if (!response) {
      setErrorMessage("Failed to notify waiter about order readiness.");
      setShowPopup(true);
    }
  };

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "being prepared"].includes(order.status)
  );

  const completedOrders = orders.filter((order) =>
    ["canceled", "ready for pick up", "delivered", "paid for"].includes(order.status)
  );

  return (
    <div className="kitchen-container">
      <button className="return-button" onClick={() => {
        setRole(0);
        navigate("/");
      }}>
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
                    <td>{order.status}</td>
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

        {/* Latest Notification */}
        <div className="latest-notification">
          <h3>Latest Notification Received</h3>
          {latestNotification ? (
            <div>
              <p><strong>Type:</strong> {latestNotification.notification_type}</p>
              <p><strong>Message:</strong> {latestNotification.message}</p>
              <p><strong>Table:</strong> {latestNotification.table_number || 'N/A'}</p>
              <p><strong>Received At:</strong> {new Date(latestNotification.created_at).toLocaleString()}</p>
            </div>
          ) : (
            <p>No notifications received.</p>
          )}
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
