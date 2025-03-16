import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For marking notifications as read
import { 
  fetchOrders, 
  updateOrderStatus, 
  fetchNotificationsForStaff, 
  callWaiter,
  confirmOrder 
} from "./api";
import "./kitchen.css";
import { STAFF_ID } from "./constants";

function Kitchen({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const staffId = localStorage.getItem(STAFF_ID); // Logged-in kitchen staff ID

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
    loadNotifications();
    const interval = setInterval(() => {
      loadOrders();
      loadNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  const loadNotifications = async () => {
    // fetchNotificationsForStaff is assumed to return only unread notifications for this staff member
    const notificationsData = await fetchNotificationsForStaff(staffId);
    setNotifications(notificationsData || []);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updatedStatus = await confirmOrder(orderId, newStatus, staffId);
  
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

  // Sends an "order_ready" notification to the waiter for the given order
  const notifyWaiterForReadyOrder = async (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || !order.waiter) {
      setErrorMessage("No waiter assigned to this order.");
      setShowPopup(true);
      return;
    }
    const waiterStaffId = order.waiter.Staff_id;
    const message = `Order #${orderId} is ready for pickup.`;
    const response = await callWaiter(waiterStaffId, orderId, message, "order_ready");
    if (!response) {
      setErrorMessage("Failed to notify waiter about order readiness.");
      setShowPopup(true);
    }
    else{
      setErrorMessage("Successfully notified waiter about order ");
      setShowPopup(true);
    }

  };

  // Allows manual notification when an "order_received" notification is clicked
  const handleNotifyWaiterFromNotification = async (orderId) => {
    await notifyWaiterForReadyOrder(orderId);
    // Optionally, mark the notification as read after notifying
  };

  // Marks a notification as read and removes it from the list
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/cafeApi/notifications/${notificationId}/mark_as_read/`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
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

        {/* Combined Unread Notifications Table */}
        <div className="notifications">
          <h3>Unread Notifications</h3>
          {notifications.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Order #</th>
                  <th>Message</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => (
                  <tr key={notif.id}>
                    <td>{notif.notification_type}</td>
                    <td>{notif.order || "N/A"}</td>
                    <td>{notif.message}</td>
                    <td>{new Date(notif.created_at).toLocaleString()}</td>
                    <td>
                      {notif.notification_type === "order_received" && (
                        <button 
                          onClick={() => handleNotifyWaiterFromNotification(notif.order)}
                          className="order-button"
                        >
                          Notify Waiter
                        </button>
                      )}
                      <button 
                        onClick={() => handleMarkNotificationRead(notif.id)}
                        className="filter-button"
                      >
                        Mark as Read
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No unread notifications.</p>
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
