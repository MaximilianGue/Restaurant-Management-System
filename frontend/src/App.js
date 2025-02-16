import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchMenuItems, fetchOrders, createOrder } from "./api"; 
import StaffLogin from "./StaffLogin"; 
import "./App.css";

function App() {
  const [role, setRole] = useState(0); 
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState(""); 

  useEffect(() => {
    const loadData = async () => {
      const items = await fetchMenuItems();
      setMenuItems(items || []);
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

  // Calculate the total price of the order
  const totalAmount = Object.keys(cart).reduce((sum, itemName) => {
    const item = menuItems.find((menuItem) => menuItem.name === itemName);
    return sum + (parseFloat(item?.price || 0) * cart[itemName]);
  }, 0).toFixed(2);

  const handlePlaceOrder = async () => {
    if (!tableNumber.trim()) {
      alert("Please enter a table number before placing an order.");
      return;
    }

    const orderData = {
      table_number: tableNumber,
      status: "pending",
      total_price: parseFloat(totalAmount),
      item_ids: Object.keys(cart).map(itemName => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return item.id;
      })
    };

    const orderResponse = await createOrder(orderData);
    if (orderResponse) {
      alert("Order placed successfully!");
      setCart({});
      setOrders([...orders, orderResponse]);
      setTableNumber(""); 
    } else {
      alert("Failed to place order.");
    }
  };

  return (
    <Router>
      <div className="container">
        <h1 className="restaurant-title">Oaxaca</h1>

        <Routes>
          <Route path="/staff-login" element={<StaffLogin setRole={setRole} />} />

          <Route path="/" element={
            <>
              <button className="staff-login" onClick={() => window.location.href = "/staff-login"}>
                Staff Login
              </button>

              {role === 0 && (
                <div className="menu-container">
                  {/* Removed the "Menu" text here */}
                  <div className="menu-grid">
                    {menuItems.length > 0
                      ? menuItems.map((item, index) => (
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
                                  <button
                                    onClick={() => handleQuantityChange(item.name, "decrease")}
                                    className="counter-btn"
                                  >
                                    -
                                  </button>
                                  <span>{cart[item.name]}</span>
                                  <button
                                    onClick={() => handleQuantityChange(item.name, "increase")}
                                    className="counter-btn"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSelect(item.name)}
                                  className="select-button"
                                >
                                  Select
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      : <p>Loading menu...</p>}
                  </div>

                  <div className="order-summary">
                    <h4>Order Summary</h4>
                    
                    <label>Enter Table Number:</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Enter table number"
                      className="table-input"
                    />

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
                        
                        {/* Total Amount Display */}
                        <div className="order-total">
                          <strong>Total: £{totalAmount}</strong>
                        </div>

                        <button 
                          onClick={handlePlaceOrder} 
                          className="order-button"
                          disabled={!tableNumber.trim() || Object.keys(cart).length === 0}
                        >
                          Place Order
                        </button>
                      </>
                    ) : (
                      <p>No items selected</p>
                    )}
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
