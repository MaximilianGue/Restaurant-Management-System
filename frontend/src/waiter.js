/**
 * Waiter Dashboard Component
 * - Handles all waiter-related views and logic
 */

import React, { useState, useEffect } from "react";  
import { useNavigate } from "react-router-dom";
import axios from "axios"; // For marking notifications as read
import { 
  fetchOrders, 
  fetchMenuItems, 
  fetchTables, 
  updateOrderStatus, 
  fetchNotificationsForStaff, 
  fetchWaiterDetails, 
  fetchWaiters, 
  fetchKitchenStaff, 
  notifyStaff 
} from "./components/api";
import "./styles/Dropdown.css";
import "./styles/waiter.css"
import { STAFF_ID } from "./constants";

function Waiter({ setRole, hiddenItems = [], setHiddenItems = () => {} }) {
  
  // States
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [tables, setTables] = useState([]);
  const staffId = localStorage.getItem(STAFF_ID);
  const [waiterDetails, setWaiterDetails] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  
  // Alert modal states
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertTableNumber, setAlertTableNumber] = useState("");
  const [alertTargetRole, setAlertTargetRole] = useState("Kitchen Staff");
  const [alertTargetId, setAlertTargetId] = useState("");
  const [alertAlertMessage, setAlertAlertMessage] = useState("");

  // Pop up
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderPopup, setShowOrderPopup] = useState(false);


  // Initial fetch waiters data
  useEffect(() => {
    fetchWaiterDetails(staffId).then(data => {
      console.log("Fetched waiter details:", data); // Add this line
      setWaiterDetails(data);
    });
  }, []);
  useEffect(() => {
    loadTables().then(() => {
      console.log("All tables:", tables); // See how waiter_name is structured
    });
  }, []);
    

  useEffect(() => {
    loadOrders();
    loadMenuItems();
    loadTables();
    fetchWaiterDetails(staffId).then(data => setWaiterDetails(data));
    loadNotifications();
    loadStaffMembers();
    const intervalOrders = setInterval(loadOrders, 5000);
    const intervalNotifications = setInterval(loadNotifications, 5000);
    return () => {
      clearInterval(intervalOrders);
      clearInterval(intervalNotifications);
    };
  }, []);

  // API helper functions (which load data)
  // Loads orders
  const loadOrders = async () => { 
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  // Loads tables
  const loadTables = async () => {
    const tablesData = await fetchTables();
    setTables(tablesData || []);
  };

  // Loads menu items
  const loadMenuItems = async () => {
    const items = await fetchMenuItems();
    setMenuItems(items || []);
  };

  // Loads notifications
  const loadNotifications = async () => {
    const notificationsData = await fetchNotificationsForStaff(staffId);
    setNotifications(notificationsData || []);
  };

  // Loads available staff (both types of staff, waiter and kitchenstaff)
  const loadStaffMembers = async () => {
    const waitersData = await fetchWaiters();
    const kitchenStaffData = await fetchKitchenStaff();
    const filteredWaiters = waitersData
      .filter(w => w.Staff_id !== staffId)
      .map(item => ({ ...item, role: "Waiter" }));
    const mappedKitchenStaff = kitchenStaffData.map(item => ({ ...item, role: "Kitchen Staff" }));
    setStaffMembers([...filteredWaiters, ...mappedKitchenStaff]);
  };

  // Order handlers
  const handleStatusChange = async (orderId, newStatus) => {
    const updatedStatus = await updateOrderStatus(orderId, newStatus, staffId);
    if (updatedStatus === newStatus) {
      setErrorMessage("Status successfully updated!");
      await loadOrders();
    } else {
      setErrorMessage("Failed to update order status.");
    }
    setShowPopup(true);
  };

  const handleCancelOrder = async (orderId) => {
    await handleStatusChange(orderId, "canceled");
  };

  const handleConfirmOrder = async (orderId) => {
    await handleStatusChange(orderId, "confirmed");
  };

  // Cancel all pending orders
  const cancelAllOrders = async () => {
    const pendingOrders = orders.filter((order) => order.status === "pending");
    if (pendingOrders.length === 0) {
      setErrorMessage("No pending orders to cancel.");
      setShowPopup(true);
      return;
    }
    let allSuccess = true;
    for (const order of pendingOrders) {
      const updatedStatus = await updateOrderStatus(order.id, "canceled", staffId);
      if (updatedStatus !== "canceled") {
        allSuccess = false;
      }
    }
    setErrorMessage(allSuccess
      ? "All pending orders have been canceled successfully!"
      : "Some pending orders could not be canceled.");
    setShowPopup(true);
    await loadOrders();
  };

  // Toggles table alert, which notifies system
  const tableAlert = async (table) => {
    if (table.status == "pending") {
      table.status = "Alert!"
      setErrorMessage("Table #" + table.number + " is in need of assistance!");
    } else {
      table.status = "pending"
      setErrorMessage("Table #" + table.number + " has been responded to.");
    }
    setShowPopup(true);
  };
  
  // Open and sends alerts to other staff
  const openAlertForm = (tableNumber) => {
    setAlertTableNumber(tableNumber);
    setAlertTargetRole("Kitchen Staff");
    setAlertTargetId("");
    setAlertAlertMessage(`Table ${tableNumber} needs assistance!`);
    setShowAlertForm(true);
  };

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const readyOrders = orders.filter((order) => order.status === "ready for pick up");
  const deliveredOrders = orders.filter((order) => order.status === "delivered");

  // Filter tables assigned to this waiter
  const waiterName = waiterDetails?.first_name || "";
  const assignedTables = tables.filter(table => table.waiter === waiterDetails?.id);

  

  const toggleHiddenItem = (itemName) => {
    setHiddenItems((prevHiddenItems) => {
      const updated =
        prevHiddenItems.includes(itemName)
          ? prevHiddenItems.filter((item) => item !== itemName)
          : [...prevHiddenItems, itemName];
  
      localStorage.setItem("hiddenItems", JSON.stringify(updated));
      return updated;
    });
  };
  
  // Send alerts using the notifyStaff API
  const handleSendAlert = async () => {
    if (!alertTargetId || !alertAlertMessage) {
      setErrorMessage("Please select a target and enter a message.");
      setShowPopup(true);
      return;
    }
    const response = await notifyStaff(staffId, alertTargetId, alertAlertMessage, alertTableNumber);
    if (response) {
      setErrorMessage("Alert message sent successfully!");
    } else {
      setErrorMessage("Failed to send alert message.");
    }
    setShowPopup(true);
    setShowAlertForm(false);
  };

  // Mark a notification as read and remove it from the list
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/cafeApi/notifications/${notificationId}/mark_as_read/`);
      setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // handels viwe order (for view order button)
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderPopup(true);
  };
  
  
  return (
    <div className="waiter-container">
      {/* Return to customer view button*/}
      <button className="return-button" onClick={() => {
        setRole(0);
        navigate("/");
      }}>
        Return to Customer View
      </button>
      <h3>Waiter Dashboard</h3>

           {/* Pending Orders section*/}
      <div className="order-table pending-orders-table">
            <h4>Pending Orders</h4>
            <table>
              <thead>
                <tr>
                  <th>Table/Order #</th>
                  <th>Total (£)</th>
                  <th>Action</th>
                  <th>Time (Min)</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <tr key={order.table_id}>
                      <td>{order.table_number} | {order.id}</td>
                      <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                      <td>
                        <button className="cancel-button" onClick={() => handleCancelOrder(order.id)}>
                          Cancel Order
                        </button>
                        <button className="confirm-button" onClick={() => handleConfirmOrder(order.id)}>
                          Confirm Order
                        </button>
                        <button onClick={() => handleViewOrder(order)}>
                        View Order
                        </button>
                      </td>
                      <td>{Math.round((new Date().getTime() - new Date(order.order_date))/60000)}</td>
                      
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4">No pending orders.</td></tr>
                )}
              </tbody>
            </table>
            <button className="cancel-all-button" onClick={cancelAllOrders}>
              Cancel All Orders
            </button>
      </div>

      <div className="order-tables">

        {/* Orders Ready for Pick Up */}
        <div className="order-table">
          <h4>Orders Ready for Pick Up</h4>
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
              {readyOrders.length > 0 ? (
                readyOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td className="status-col">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="ready for pick up">ready for pick up</option>
                        <option value="delivered">delivered</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleViewOrder(order)}>
                        View Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No orders ready for pick up.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delivered Orders section (Awaiting Payment) */}
        <div className="order-table">
          <h4>Delivered Orders (Awaiting Payment)</h4>
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
              {deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td className="status-col">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="delivered">delivered</option>
                        <option value="paid for">paid for</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleViewOrder(order)}>
                        View Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No delivered orders awaiting payment.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Table Alert System section*/}
      <div className="table-alert">
        <h4>Table Alert System</h4>
        <table>
          <thead>
            <tr>
              <th>Table #</th>
              <th>Status</th>
              <th>Assigned Waiter</th>
              <th>Alert</th>
            </tr>
          </thead>
          <tbody>
            {assignedTables.length > 0 ? (
              assignedTables.map((table) => (
                <tr key={table.number}>
                  <td>{table.number}</td>
                  <td>{table.status}</td>
                  <td>{table.waiter_name}</td>
                  <td>
                    <button className="alert-button" onClick={() => openAlertForm(table.number)}>
                      Alert!
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No tables assigned to you.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      
    
    {/* Hide/Unhide Menu Items section */}
    <div className="menu-select">
      <h4>Hide/Unhide Menu Items</h4>
      {menuItems.length > 0 ? (
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item">
              <label>
                <input
                  type="checkbox"
                  checked={!hiddenItems.includes(item.name)}
                  onChange={() => toggleHiddenItem(item.name)}
                />
                {item.name}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p>No menu items available.</p>
      )}
    </div>


      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="alert-modal-overlay">
          <div className="alert-modal-content">
            <div className="alert-modal-header">
              <h4>Send Alert for Table {alertTableNumber}</h4>
              <button
                className="modal-close-button"
                onClick={() => setShowAlertForm(false)}
                aria-label="Close alert modal"
              >
                &times;
              </button>
            </div>
            <div className="alert-modal-body">
              <div className="form-group">
                <label htmlFor="target-role">Target Role:</label>
                <select
                  id="target-role"
                  value={alertTargetRole}
                  onChange={(e) => {
                    setAlertTargetRole(e.target.value);
                    setAlertTargetId("");
                  }}
                >
                  <option value="Kitchen Staff">Kitchen Staff</option>
                  <option value="Waiter">Waiter</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="target-staff">Target Staff:</label>
                <select
                  id="target-staff"
                  value={alertTargetId}
                  onChange={(e) => setAlertTargetId(e.target.value)}
                >
                  <option value="">Select Staff</option>
                  {staffMembers
                    .filter(staff => staff.role === alertTargetRole)
                    .map((staff) => (
                      <option key={staff.Staff_id || staff.id} value={staff.Staff_id || staff.id}>
                        {staff.first_name} {staff.last_name} ({staff.role})
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="alert-message">Message:</label>
                <input
                  id="alert-message"
                  type="text"
                  value={alertAlertMessage}
                  onChange={(e) => setAlertAlertMessage(e.target.value)}
                />
              </div>
            </div>
            <div className="alert-modal-footer">
              <button className="order-button" onClick={handleSendAlert}>
                Send Alert
              </button>
              <button className="filter-button" onClick={() => setShowAlertForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Latest Notifications Section */}
      <div className="notifications">
        <h4>Latest Notifications</h4>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <tr key={notification.id}>
                  <td>{notification.notification_type}</td>
                  <td>{notification.message}</td>
                  <td>{new Date(notification.created_at).toLocaleString()}</td>
                  <td>
                    <button onClick={() => handleMarkNotificationRead(notification.id)}>Read</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No notifications.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popups for error messages*/}
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

export default Waiter;
