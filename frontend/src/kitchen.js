import React from 'react';

function Kitchen({ orders }) {
  return (
    <div className="order-list">
      <h3>Orders for Kitchen:</h3>
      {orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className="order-summary-item">
            <span>Order #{order.id} - £{parseFloat(order.total_price || 0).toFixed(2)}</span>
            <span>Status: {order.status}</span>
            <span>Table: {order.table_number}</span>
          </div>
        ))
      ) : (
        <p>No orders available.</p>
      )}
    </div>
  );
}

export default Kitchen;
