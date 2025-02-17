import React from 'react';

const cancelTopOrder = () => {

};

const progressTopOrder = () => {

};

const Waiter = ({ orders }) => {  // Use capitalized name and pass 'orders' as a prop
  return (
    <div className="order-list">
      <h3>Orders for Waiters:</h3>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className="order-summary-item">
            <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
          </div>
        ))
      ) : (
        <p>No orders available.</p>)}
        <button onClick={() => cancelTopOrder()} className="waiter-order-btn">Cancel Top Order</button>
        <button onClick={() => progressTopOrder()} className="waiter-order-btn">Progress Top Order</button>
    </div>
  );
};

export default Waiter;


