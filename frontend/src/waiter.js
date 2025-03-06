import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchOrders,
  fetchMenuItems,
  fetchTables,
  updateOrderStatus,
  fetchWaiterDetails,
  fetchWaiters,
  fetchKitchenStaff,
  notifyStaff,
  fetchNotificationsForStaff
} from "./api";
import "./Dropdown.css";
import { STAFF_ID } from "./constants";

function Waiter({ setRole, hiddenItems = [], setHiddenItems = () => {} }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [message, setMessage] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [latestNotification, setLatestNotification] = useState(null);
  const [staffType, setStaffType] = useState("kitchen_staff");

  const staffId = localStorage.getItem(STAFF_ID);

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    await loadOrders();
    await loadMenuItems();
    await loadTables();
    await loadLatestNotification();
    loadStaffList("kitchen_staff"); // default
  };

  const loadOrders = async () => {
    const allOrders = await fetchOrders();
    const waiterDetails = await fetchWaiterDetails(staffId);

    const waiterOrders = allOrders.filter(order => order.waiter?.Staff_id === waiterDetails.Staff_id);
    setOrders(waiterOrders || []);
  };

  const loadTables = async () => {
    const allTables = await fetchTables();
    const waiterDetails = await fetchWaiterDetails(staffId);

    const waiterName = `${waiterDetails.first_name} ${waiterDetails.last_name}`;
    const filteredTables = allTables.filter(table => table.waiter_name === waiterName);
    setTables(filteredTables || []);
  };

  const loadMenuItems = async () => {
    const items = await fetchMenuItems();
    setMenuItems(items || []);
  };

  const loadLatestNotification = async () => {
    const notifications = await fetchNotificationsForStaff(staffId);
    setLatestNotification(notifications?.[0] || null);
  };

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

  const handleCancelOrder = (orderId) => handleStatusChange(orderId, "canceled");

  const cancelAllOrders = async () => {
    const pendingOrders = orders.filter(o => o.status === "pending");
    if (pendingOrders.length === 0) {
      setErrorMessage("No pending orders to cancel.");
      setShowPopup(true);
      return;
    }

    for (const order of pendingOrders) {
      await updateOrderStatus(order.id, "canceled", staffId);
    }
    setErrorMessage("All pending orders have been canceled!");
    setShowPopup(true);
    await loadOrders();
  };

  const loadStaffList = async (type) => {
    if (type === "kitchen_staff") {
      const kitchenStaff = await fetchKitchenStaff();
      setStaffList(kitchenStaff || []);
    } else {
      const waiters = await fetchWaiters();
      setStaffList(waiters.filter(w => w.Staff_id !== staffId) || []);
    }
  };

  const handleStaffTypeChange = (type) => {
    setStaffType(type);
    setSelectedStaff("");
    loadStaffList(type);
  };

  const sendNotification = async () => {
    if (!selectedTable || !selectedStaff) {
      setErrorMessage("Please select both a table and a staff member.");
      setShowPopup(true);
      return;
    }

    const finalMessage = message || `Assistance needed at table ${selectedTable}.`;
    const success = await notifyStaff(staffId, selectedStaff, finalMessage, selectedTable);

    if (success) {
      setErrorMessage("Notification sent successfully!");
      await loadLatestNotification();
    } else {
      setErrorMessage("Failed to send notification.");
    }
    setShowPopup(true);
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const readyOrders = orders.filter(o => o.status === "ready for pick up");
  const deliveredOrders = orders.filter(o => o.status === "delivered");

  const toggleHiddenItem = (itemName) => {
    setHiddenItems(prev =>
      prev.includes(itemName)
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    );
  };

  const renderOrderRow = (order) => (
    <tr key={order.id}>
      <td>{order.id}</td>
      <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
      <td>
        <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
          <option value="ready for pick up">ready for pick up</option>
          <option value="delivered">delivered</option>
          <option value="paid for">paid for</option>
          <option value="canceled">canceled</option>
        </select>
      </td>
    </tr>
  );

  return (
    <div className="waiter-container">
      <button className="return-button" onClick={() => { setRole(0); navigate("/"); }}>Return to Customer View</button>
      <h3>Waiter Dashboard</h3>

      <div className="order-tables">
        <div className="order-table">
          <h4>Orders Ready for Pick Up</h4>
          <table><tbody>{readyOrders.map(renderOrderRow)}</tbody></table>
        </div>

        <div className="order-table">
          <h4>Delivered Orders (Awaiting Payment)</h4>
          <table><tbody>{deliveredOrders.map(renderOrderRow)}</tbody></table>
        </div>

        <div className="order-table">
          <h4>Pending Orders</h4>
          <table>
            <tbody>
              {pendingOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>£{parseFloat(order.total_price || 0).toFixed(2)}</td>
                  <td><button onClick={() => handleCancelOrder(order.id)}>Cancel</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={cancelAllOrders}>Cancel All Orders</button>
        </div>
      </div>

      <div className="menu-select">
        <h4>Hide/Unhide Menu Items</h4>
        {menuItems.map(item => (
          <div key={item.id}>
            <input
              type="checkbox"
              checked={!hiddenItems.includes(item.name)}
              onChange={() => toggleHiddenItem(item.name)}
            />
            {item.name}
          </div>
        ))}
      </div>

      <div className="table-alert">
        <h4>Table Alert System</h4>
        <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
          <option value="">Select Table</option>
          {tables.map(t => <option key={t.number} value={t.number}>Table {t.number}</option>)}
        </select>

        <select value={staffType} onChange={(e) => handleStaffTypeChange(e.target.value)}>
          <option value="kitchen_staff">Kitchen Staff</option>
          <option value="waiter">Another Waiter</option>
        </select>

        <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
          <option value="">Select Staff Member</option>
          {staffList.map(staff => <option key={staff.Staff_id} value={staff.Staff_id}>{staff.first_name} {staff.last_name}</option>)}
        </select>

        <input placeholder="Optional message" value={message} onChange={e => setMessage(e.target.value)} />
        <button onClick={sendNotification}>Send Alert</button>
      </div>

      {showPopup && <div><p>{errorMessage}</p><button onClick={() => setShowPopup(false)}>Close</button></div>}
    </div>
  );
}

export default Waiter;
