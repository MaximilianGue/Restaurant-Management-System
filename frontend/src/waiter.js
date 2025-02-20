import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, updateOrderStatus, deleteOrder } from "./api";

function Waiter() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState([]);
  const [status, setStatus] = useState([]);
  const [staffId, setStaffId] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {
      const loadData = async () => {
        const ordersData = await fetchOrders();
        setOrders(ordersData || []);
      };
      loadData();
    }, []);

  const cancelOrder = async (Id) => {
    const newOrderId = Id
    setOrderId(newOrderId);

    const statusCode = await deleteOrder(newOrderId);

    console.log(statusCode);

    if (statusCode === undefined) {
        setErrorMessage("order successfully cancelled");
    } else {
        setErrorMessage("Failed to cancel the order");
    }

    setShowPopup(true);
  };


  const confirmOrder = async (Id) => {
    const newOrderId = Id;
    const newStatus = "delivered";
    const newStaffId = "X1";

    setOrderId(newOrderId);
    setStatus(newStatus);
    setStaffId(newStaffId);

    const returnStatus = await updateOrderStatus(newOrderId, newStatus, newStaffId);

    console.log(returnStatus);

    if (newStatus === returnStatus) {
        setErrorMessage("Status successfully updated");
    } else {
        setErrorMessage("Failed to update status");
    }

    setShowPopup(true);
};
  // Use capitalized name and pass 'orders' as a prop
  return (
    <div className="order-list">
      <button className="return-button" onClick={() => navigate("/")}>Return to Customer View</button>
      <h3>Orders for Waiters:</h3>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className="order-summary-item">
            <span>Table #{order.table_id} | </span>
            <span>| Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
            <button onClick={() => cancelOrder(order.id)} className="waiter-order-btn">Cancel Order</button>
            <button onClick={() => confirmOrder(order.id)} className="waiter-order-btn">Confirm Order</button>
          </div>
     
        ))
      ) : (
        <p>No orders available.</p>)}
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






