import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { fetchMenuItems, fetchCustomers, fetchOrders, createOrder } from "./api"; 
import StaffLogin from "./StaffLogin"; // Import StaffLogin component
import "./App.css";

function App() {
  const [role, setRole] = useState(0); // Default role: Customer
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const items = await fetchMenuItems();
      setMenuItems(items || []);
      
      const customersData = await fetchCustomers();
      setCustomers(customersData || []);

      const ordersData = await fetchOrders();
      setOrders(ordersData || []);
    };
    loadData();
  }, []);

  useEffect(() => {
    document.body.classList.remove("waiter", "kitchen");
    if (role === 1) document.body.classList.add("waiter");
    if (role === 2) document.body.classList.add("kitchen");
  }, [role]);

  return (
    <Router>
      <div className="container">
        <h1 className="restaurant-title">Oaxaca</h1>

        {/* Navigation */}
        <Routes>
          {/* Staff Login Route */}
          <Route path="/staff-login" element={<StaffLogin setRole={setRole} />} />

          {/* Main App */}
          <Route path="/" element={
            <>
              <button className="staff-login" onClick={() => window.location.href = "/staff-login"}>
                Staff Login
              </button>

              {role === 0 && (
                <div className="menu-container">
                  <h3>Menu:</h3>
                  <div className="menu-grid">
                    {menuItems.length > 0 ? menuItems.map((item, index) => (
                      <div className="menu-item" key={index}>
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="menu-item-image" 
                          onError={(e) => e.target.src = "/fallback-image.jpg"} 
                        />
                        <div className="menu-item-details">
                          <h4>{item.name}</h4>
                          <p className="price">£{item.price}</p>
                          <p><strong>Allergies:</strong> {item.allergies.join(", ")}</p>
                        </div>
                      </div>
                    )) : <p>Loading menu...</p>}
                  </div>
                </div>
              )}

              {role === 1 && (
                <div className="order-list">
                  <h3>Orders for Waiters:</h3>
                  {orders.length > 0 ? orders.map((order, index) => (
                    <div key={index} className="order-summary-item">
                      <span>Order #{order.id} - £{order.total_price.toFixed(2)}</span>
                      <span>Status: {order.status}</span>
                    </div>
                  )) : <p>No orders available.</p>}
                </div>
              )}
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
