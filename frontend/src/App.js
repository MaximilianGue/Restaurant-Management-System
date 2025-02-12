import React, { useState, useEffect } from "react";
import { fetchMenuItems, fetchCustomers, fetchOrders, createOrder } from "./api"; 
import "./App.css";



function App() {
  const [role, setRole] = useState(0);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const roles = ["Customer", "Waiter", "Kitchen"];

  // Fetch data from the backend
  useEffect(() => {
    const loadData = async () => {
      const items = await fetchMenuItems();
      setMenuItems(items || []); // Ensure non-empty array

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

  const handleSliderChange = (event) => {
    setRole(Number(event.target.value));
  };

  const getRoleTextColor = () => (role === 1 ? "green-text" : role === 2 ? "orange-text" : "");

  const handleSelect = (itemName) => {
    setCart((prevCart) => ({ ...prevCart, [itemName]: 1 }));
  };

  const handleQuantityChange = (itemName, type) => {
    setCart((prevCart) => {
      const currentQuantity = prevCart[itemName] || 1;
      let newQuantity = type === "increase" ? currentQuantity + 1 : currentQuantity - 1;

      if (newQuantity < 1) {
        const updatedCart = { ...prevCart };
        delete updatedCart[itemName];
        return updatedCart;
      }
      return { ...prevCart, [itemName]: newQuantity };
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer before placing an order.");
      return;
    }

    const orderData = {
      customer: selectedCustomer,
      status: "pending",
      total_price: Object.keys(cart).reduce((sum, itemName) => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return sum + (parseFloat(item.price) * cart[itemName]);
      }, 0),
    };

    const orderResponse = await createOrder(orderData);
    if (orderResponse) {
      alert("Order placed successfully!");
      setCart({});
      setOrders([...orders, orderResponse]); 
    } else {
      alert("Failed to place order.");
    }
  };

  const cancelTopOrder = () => {

  };

  const progressTopOrder = () => {

  };

  return (
    <div className="container">
      <h1 className="restaurant-title">Oaxaca</h1>

      <div className="role-selector">
        <label htmlFor="role-slider" className="role-label">Select your role:</label>
        <div className="slider-container">
          <input
            type="range"
            id="role-slider"
            min="0"
            max="2"
            step="1"
            value={role}
            onChange={handleSliderChange}
            className="slider"
          />
          <div className="slider-labels">
            <span>{roles[0]}</span>
            <span>{roles[1]}</span>
            <span>{roles[2]}</span>
          </div>
        </div>
        <div className="selected-role">
          <h3>Selected Role: <span className={getRoleTextColor()}>{roles[role]}</span></h3>
        </div>
      </div>

      {role === 0 && ( /* Customer Page Code */
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

                  {cart[item.name] ? (
                    <div className="counter">
                      <button onClick={() => handleQuantityChange(item.name, "decrease")} className="counter-btn">-</button>
                      <span>{cart[item.name]}</span>
                      <button onClick={() => handleQuantityChange(item.name, "increase")} className="counter-btn">+</button>
                    </div>
                  ) : (
                    <button onClick={() => handleSelect(item.name)} className="select-button">Select</button>
                  )}
                </div>
              </div>
            )) : <p>Loading menu...</p>}
          </div>

          <div className="order-summary">
            <h4>Order Summary</h4>
            <label>Select Customer:</label>
            <select onChange={(e) => setSelectedCustomer(e.target.value)}>
              <option value="">-- Select Customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </option>
              ))}
            </select>

            {Object.keys(cart).length > 0 ? (
              <>
                {Object.keys(cart).map((itemName) => {
                  const item = menuItems.find((menuItem) => menuItem.name === itemName);
                  return (
                    <div key={itemName} className="order-summary-item">
                      <span>{itemName} x{cart[itemName]}</span>
                      <span>£{(parseFloat(item.price) * cart[itemName]).toFixed(2)}</span>
                    </div>
                  );
                })}
                <button onClick={handlePlaceOrder} className="order-button">Place Order</button>
              </>
            ) : (
              <p>No items selected</p>
            )}
          </div>
        </div>
      )}

      {role === 1 && ( /* Waiter Page Code */
        <div className="order-list">
          <h3>Orders for Waiters:</h3>
          {orders.length > 0 ? orders.map((order, index) => ( /* Checks if there is any order data, displaying it if so. */
            <div key={index} className="order-summary-item">
              <span>Order #{order.id} - £{order.total_price.toFixed(2)}</span>
              <span>Status: {order.status}</span>
            </div>
          )) : <p>No orders available.</p>}
        <button onClick={() => cancelTopOrder()} className="waiter-order-btn">Cancel Top Order</button>
        <button onClick={() => progressTopOrder()} className="waiter-order-btn">Progress Top Order</button>
        </div>
      )}
    </div>
  );
}

export default App;
