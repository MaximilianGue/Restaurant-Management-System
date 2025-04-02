import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { 
  fetchOrders, 
  updateOrderStatus, 
  fetchNotificationsForStaff, 
  callWaiter,
  confirmOrder 
} from "./components/api";
import "./styles/kitchen.css";
import { STAFF_ID } from "./constants";

/**
 * Kitchen component, which is used by kitchen staff to:
 * - Track different orders, change their status, view notifications and notify waiters when orders are ready
 */
function Kitchen({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const staffId = localStorage.getItem(STAFF_ID); 

  // For view ordr pop up
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);


  const statusOptions = [
    "pending",
    "confirmed",
    "being prepared",
    "canceled",
    "ready for pick up",
    "delivered",
    "paid for",
  ];

    // Load orders and notifications at first and then poll every 5 seconds
  useEffect(() => {
    loadOrders();
    loadNotifications();
    const interval = setInterval(() => {
      loadOrders();
      loadNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetches orders from api
  const loadOrders = async () => {
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

   // Fetches unread notifications for this specific staff member
  const loadNotifications = async () => {
    const notificationsData = await fetchNotificationsForStaff(staffId);
    setNotifications(notificationsData || []);
  };

  // Updates order status and notifies waiter when ready
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

  // Sends notification to waiter so that he know that the order is ready for pickup
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

    // Handles notification action
  const handleNotifyWaiterFromNotification = async (orderId) => {
    await notifyWaiterForReadyOrder(orderId);
  };

  // Marks a notification as read and updates its state
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/cafeApi/notifications/${notificationId}/mark_as_read/`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Handles View order button
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderPopup(true);
  };
  

  // Filters active and completed orders based on their status
  const activeOrders = orders.filter((order) =>
    ["confirmed", "being prepared"].includes(order.status)
  );
  const completedOrders = orders.filter((order) =>
    ["canceled", "ready for pick up", "delivered", "paid for"].includes(order.status)
  );

  /* Renders main component*/ 
  return (
    <div className="kitchen-container">
      {/* Button to return to the customer view */}
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
                <th>Table/Order #</th>
                <th>Total (£)</th>
                <th>Status</th>
                <th>Time (Min)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeOrders.length > 0 ? (
                activeOrders.map((order) => (
                  <tr key={order.table_id}>
                    <td>{order.table_number} | {order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="being prepared">being prepared</option>
                        <option value="ready for pick up">ready for pick up</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </td>
                    <td>{Math.round((new Date().getTime() - new Date(order.order_date))/60000)}</td>
                    <td>
                      <button onClick={() => handleViewOrder(order)}>
                        View Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No active orders</td>
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
                  <td colSpan="3">No completed orders</td>
                </tr>
              )}
            </tbody>
          </table>
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
      </div>

      {/* Popups for the status or error messages */}
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
            <p><strong>Order ID:</strong> {selectedOrder.id}</p>
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
            <button
              className="close-button"
              onClick={() => setShowOrderPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>

  );
}

export default Kitchen;
