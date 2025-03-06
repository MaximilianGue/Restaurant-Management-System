import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, fetchMenuItems, fetchTables, updateOrderStatus } from "./api";
import "./Dropdown.css";

function Waiter({ setRole, hiddenItems = [], setHiddenItems = () => {} }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    loadOrders();
    loadMenuItems();
    loadTables();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => { 
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  const loadTables = async () => {
    const tablesData = await fetchTables();
    setTables(tablesData || []);
  };

  const loadMenuItems = async () => {
    const items = await fetchMenuItems();
    setMenuItems(items || []);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const staffId = "X1";
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

  // New function to cancel all pending orders
  const cancelAllOrders = async () => {
    const pendingOrders = orders.filter((order) => order.status === "pending");
    if (pendingOrders.length === 0) {
      setErrorMessage("No pending orders to cancel.");
      setShowPopup(true);
      return;
    }
    const staffId = "X1";
    let allSuccess = true;
    for (const order of pendingOrders) {
      const updatedStatus = await updateOrderStatus(order.id, "canceled", staffId);
      if (updatedStatus !== "canceled") {
        allSuccess = false;
      }
    }
    if (allSuccess) {
      setErrorMessage("All pending orders have been canceled successfully!");
    } else {
      setErrorMessage("Some pending orders could not be canceled.");
    }
    setShowPopup(true);
    await loadOrders();
  };

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

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const readyOrders = orders.filter((order) => order.status === "ready for pick up");
  const deliveredOrders = orders.filter((order) => order.status === "delivered");
  const knownTables = tables;

  const toggleHiddenItem = (itemName) => {
    setHiddenItems((prevHiddenItems) =>
      prevHiddenItems.includes(itemName)
        ? prevHiddenItems.filter((item) => item !== itemName)
        : [...prevHiddenItems, itemName]
    );
  };

  return (
    <div className="waiter-container">
      <button className="return-button" onClick={() => {
        setRole(0);
        navigate("/");
      }}>
        Return to Customer View
      </button>
      <h3>Waiter Dashboard</h3>

      <div className="order-tables">
        <div className="order-table">
          <h4>Orders Ready for Pick Up</h4>
          <table>
            <thead>
              <tr><th>Order #</th><th>Total (£)</th><th>Status</th></tr>
            </thead>
            <tbody>
              {readyOrders.length > 0 ? (
                readyOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="ready for pick up">ready for pick up</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No orders ready for pick up.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="order-table">
          <h4>Delivered Orders (Awaiting Payment)</h4>
          <table>
            <thead>
              <tr><th>Order #</th><th>Total (£)</th><th>Status</th></tr>
            </thead>
            <tbody>
              {deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                        <option value="delivered">delivered</option>
                        <option value="paid for">paid for</option>
                        <option value="canceled">canceled</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No delivered orders awaiting payment.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="order-table">
          <h4>Pending Orders</h4>
          <table>
            <thead>
              <tr><th>Order #</th><th>Total (£)</th><th>Action</th></tr>
            </thead>
            <tbody>
              {pendingOrders.length > 0 ? (
                pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                    <td>
                      <button className="cancel-button" onClick={() => handleCancelOrder(order.id)}>
                        Cancel Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3">No pending orders.</td></tr>
              )}
            </tbody>
          </table>
          {/* New Cancel All Orders Button */}
          <button className="cancel-all-button" onClick={cancelAllOrders}>
            Cancel All Orders
          </button>
        </div>

        <div className="menu-select">
          <h4>Hide/Unhide Menu Items</h4>
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <div key={item.id} className="menu-item">
                <label>
                  <input
                    type="checkbox"
                    checked={!hiddenItems?.includes?.(item.name)}
                    onChange={() => toggleHiddenItem(item.name)}
                  />
                  {item.name}
                </label>
              </div>
            ))
          ) : (
            <p>No menu items available.</p>
          )}
        </div>
      </div>

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
            {knownTables.length > 0 ? (
              knownTables.map((table) => (
                <tr key={table.number}>
                  <td>{table.number}</td>
                  <td>{table.status}</td>
                  <td>{table.waiter_name}</td>
                  <td>
                    <button className="alert-button" onClick={() => tableAlert(table)}>
                      Toggle Alert!
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No pending orders.</td>
              </tr>
            )}
          </tbody>
        </table>
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

export default Waiter;
