import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, updateOrderStatus, deleteOrder } from "./api";
import "./Dropdown.css"; 
//import Dropdown from './dropdown.js';

function Waiter({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [statusChoice, setStatusChoice] = useState("");

  const setStatus = async (status) => {
    setStatusChoice(status);
  };

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };

    // Automatically refresh orders every 5 seconds
    useEffect(() => {
      loadOrders();
  
      const interval = setInterval(() => {
        loadOrders();
      }, 5000);
  
      return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

  // Fetch orders on load and refresh when needed
  const loadOrders = async () => {
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    const statusCode = await deleteOrder(orderId);

    if (statusCode ==undefined) {
      setErrorMessage("Order successfully cancelled!");
      await loadOrders(); // Refresh orders after deletion
  
      } else {
        setErrorMessage("Failed to cancel the order.");
      }

    setShowPopup(true);
  };

  const progressOrder = async (orderId) => {
    const newStatus = "completed";
    const staffId = "X1";

    const returnStatus = await updateOrderStatus(orderId, newStatus, staffId);

    if (returnStatus === newStatus) {
      setErrorMessage("Status successfully updated!");
      await loadOrders(); // Refresh orders after updating status
    } else {
      setErrorMessage("Failed to update status.");
    }

    setShowPopup(true);
  };

  return (
    <div className="order-list">
      <button className="return-button" onClick={() => { 
        setRole(0); // Reset role to customer
        navigate("/"); 
      }}>
        Return to Customer View
      </button>
      {/*<div className="dropdown">
        <button className="dropdown-button" onClick={toggleDropdown}>
          Select an option <i className={`fas fa-caret-${isOpen ? 'up' : 'down'}`}></i>
        </button>
        {isOpen && (
          <div className="dropdown-content">
            <a><i className="PendingDropdown" onClick={() => setStatus("Pending")} ></i> Pending</a>
            <a><i className="CompletedDropdown" onClick={() => setStatus("Completed")} ></i> Completed</a>
            <a><i className="CanceledDropdown" onClick={() => setStatus("Canceled")} ></i> Canceled</a>
          </div>
        )}
      </div>*/}
      <h3>Orders for Waiters:</h3>
      {orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="order-summary-item">
            <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
            <button onClick={() => cancelOrder(order.id)} className="waiter-order-btn">Cancel Order</button>
            <button onClick={() => progressOrder(order.id)} className="waiter-order-btn">Progress Order</button>
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

export default Waiter;
