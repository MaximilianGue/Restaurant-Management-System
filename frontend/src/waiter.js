import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrders, updateOrderStatus } from "./api";
import "./Dropdown.css";

function Waiter({ setRole }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  /**
   *  calls loadOrders on load and refreshes every 5 seconds.
   */
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * loadOrders function to fetch order data from the backend.
   * Accepts no inputs
   */
  const loadOrders = async () => { 
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  
  /**
   * Handler to update the order status using the API.
   * Accepts 2 inputs, orderId (string) and newStatus (string).
   */
  const handleStatusChange = async (orderId, newStatus) => {
    const staffId = "X1"; // Replace with actual staff ID if available
    const updatedStatus = await updateOrderStatus(orderId, newStatus, staffId);

    if (updatedStatus === newStatus) {
      setErrorMessage("Status successfully updated!");
      await loadOrders(); // Refresh the orders list
    } else {
      setErrorMessage("Failed to update order status.");
    }
    setShowPopup(true);
  };

  /** 
   * Filter orders into the two categories for waiters:
   * Left table: orders that are ready for pick up.
   * Right table: orders that have been delivered (awaiting payment).
   */ 
  const readyOrders = orders.filter(
    (order) => order.status === "ready for pick up"
  );
  const deliveredOrders = orders.filter((order) => order.status === "delivered");

  return (
    <div className="waiter-container">
      <button
        className="return-button"
        onClick={() => {
          setRole(0);
          navigate("/");
        }}
      >
        Return to Customer View
      </button>
      <h3>Waiter Dashboard</h3>
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
              </tr>
            </thead>
            <tbody>
              {readyOrders.length > 0 ? (
                readyOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      £
                      {parseFloat(order.total_price || 0).toFixed(2)}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        {/* The waiter should only update a “ready” order to “delivered” */}
                        <option value="ready for pick up">ready for pick up</option>
                        <option value="delivered">delivered</option>

                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No orders ready for pick up.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Delivered Orders (Awaiting Payment) */}
        <div className="order-table">
          <h4>Delivered Orders (Awaiting Payment)</h4>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Total (£)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveredOrders.length > 0 ? (
                deliveredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      £
                      {parseFloat(order.total_price || 0).toFixed(2)}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        {/* For a delivered order, the next logical status is "paid For" */}
                        <option value="ready for pick up">ready for pick up</option>
                        <option value="delivered">delivered</option>
                        <option value="paid for">paid For</option>
                        <option value="canceled">canceled</option>
                        
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">
                    No delivered orders awaiting payment.
                  </td>
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

export default Waiter;
