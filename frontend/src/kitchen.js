import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchOrders,
  updateOrderStatus,
  fetchNotificationsForStaff,
  callWaiter,
  confirmOrder,
  confirmOrderAvailability  // Imported new API function
} from "./components/api";
import "./styles/kitchen.css";
import { STAFF_ID } from "./constants";

/**
 * Kitchen component used by kitchen staff to:
 * - Track orders, update their status (with proper validations),
 * - View notifications and notify waiters when orders are ready,
 * - View order details in a popup.
 */
function Kitchen({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // For viewing order details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);

  const staffId = localStorage.getItem(STAFF_ID);

  // Allowed options for status change on active orders.
  const allowedOptions = [
    "being prepared",
    "ready for pick up",
    "canceled"
  ];

  // Full list of statuses for display purposes.
  const statusOptions = [
    "pending",
    "confirmed",
    "being prepared",
    "canceled",
    "ready for pick up",
    "delivered",
    "paid for"
  ];

  // Load orders and notifications on mount and poll every 5 seconds.
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
    const notificationsData = await fetchNotificationsForStaff(staffId);
    setNotifications(notificationsData || []);
  };

  // Handles status change with validation and API calls.
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      setErrorMessage("Order not found.");
      setShowPopup(true);
      return;
    }

    // "Ready for pick up" can only be set if current status is "being prepared".
    if (newStatus === "ready for pick up" && order.status !== "being prepared") {
      setErrorMessage("Order must be in 'being prepared' status to mark as 'ready for pick up'.");
      setShowPopup(true);
      return;
    }

    // For "being prepared", first check availability.
    if (newStatus === "being prepared") {
      const result = await confirmOrderAvailability(orderId);
      if (result && result.can_prepare) {
        const updatedStatus = await confirmOrder(orderId, "being prepared", staffId);
        if (updatedStatus === "being prepared") {
          setOrders((prevOrders) =>
            prevOrders.map((o) => (o.id === orderId ? { ...o, status: "being prepared" } : o))
          );
          setErrorMessage(result.message || "Order status updated to 'being prepared'.");
        } else {
          setErrorMessage("Failed to update order status to 'being prepared'.");
        }
      } else {
        setErrorMessage(result ? result.message : "Not enough availability to mark order as 'being prepared'.");
      }
      setShowPopup(true);
      await loadOrders();
      return;
    }

    // For "canceled", update status directly.
    if (newStatus === "canceled") {
      const updatedStatus = await confirmOrder(orderId, "canceled", staffId);
      if (updatedStatus === "canceled") {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === orderId ? { ...o, status: "canceled" } : o))
        );
        setErrorMessage("Order status updated to 'canceled'.");
      } else {
        setErrorMessage("Failed to update order status to 'canceled'.");
      }
      setShowPopup(true);
      await loadOrders();
      return;
    }

    // For "ready for pick up", current status must be "being prepared".
    if (newStatus === "ready for pick up") {
      const updatedStatus = await confirmOrder(orderId, "ready for pick up", staffId);
      if (updatedStatus === "ready for pick up") {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === orderId ? { ...o, status: "ready for pick up" } : o))
        );
        setErrorMessage("Order status updated to 'ready for pick up'.");
        await notifyWaiterForReadyOrder(orderId);
      } else {
        setErrorMessage("Failed to update order status to 'ready for pick up'.");
      }
      setShowPopup(true);
      await loadOrders();
      return;
    }
  };

  // Notifies the assigned waiter that the order is ready.
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
    } else {
      setErrorMessage("Successfully notified waiter about order readiness.");
    }
    setShowPopup(true);
  };

  // Handles notification action for notifying waiter from a notification.
  const handleNotifyWaiterFromNotification = async (orderId) => {
    await notifyWaiterForReadyOrder(orderId);
  };

  // Marks a notification as read.
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/cafeApi/notifications/${notificationId}/mark_as_read/`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handles view order button.
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderPopup(true);
  };

  // Filter orders into active and completed groups.
  const activeOrders = orders.filter((order) =>
    ["confirmed", "being prepared"].includes(order.status)
  );
  const completedOrders = orders.filter((order) =>
    ["canceled", "ready for pick up", "delivered", "paid for"].includes(order.status)
  );

  return (
    <div className="kitchen-container">
      <button
        className="return-button"
        onClick={() => {
          setRole(0);
          navigate("/");
        }}
      >
        Return to Customer View
      </button>

      <div className="order-tables">
        {/* Active Orders Table */}
        <div className="order-table">
          <h3>Active Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Table/Order #</th>
                <th>Total (£)</th>
                <th>Status</th>
                <th>Time (Min)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => {
                  // If the order’s current status is not one of the allowed options,
                  // add it as a disabled option so that staff can see the current status.
                  const currentNotAllowed = !allowedOptions.includes(order.status);
                  return (
                    <tr key={order.table_id}>
                      <td>
                        {order.table_number} | {order.id}
                      </td>
                      <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                      <td className="status-col">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          {currentNotAllowed && (
                            <option value={order.status} disabled>
                              {order.status}
                            </option>
                          )}
                          {allowedOptions.map((option) => (
                            <option
                              key={option}
                              value={option}
                              disabled={
                                option === "ready for pick up" &&
                                order.status !== "being prepared"
                              }
                            >
                              {option}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {Math.round((new Date().getTime() - new Date(order.order_date)) / 60000)}
                      </td>
                      <td>
                        <button onClick={() => handleViewOrder(order)}>
                          View Order
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">No active orders</td>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedOrders.length > 0 ? (
                completedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>
                      <button onClick={() => handleViewOrder(order)}>
                        View Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No completed orders</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unread Notifications Table */}
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

      {/* Popup for status or error messages */}
      {showPopup && (
        <div className="custom-popup">
          <p>{errorMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}

      {/* Popup to view order details */}
      {showOrderPopup && selectedOrder && (
        <div className="order-popup-overlay">
          <div className="order-popup-content">
            <h3>Order Details:</h3>
            <p>
              <strong>Order ID:</strong> {selectedOrder.id}
            </p>
            <p>
              <strong>Status:</strong> {selectedOrder.status} <br />
              <strong>Total Price:</strong> £{parseFloat(selectedOrder.total_price || 0).toFixed(2)}
            </p>
            <h4>Items</h4>
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <ul>
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>
                    {item.name} x {item.quantity} – £{parseFloat(item.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items found for this order.</p>
            )}
            <button className="close-button" onClick={() => setShowOrderPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kitchen;
