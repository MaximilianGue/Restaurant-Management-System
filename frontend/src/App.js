import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchMenuItems, fetchOrders, createOrder } from "./api"; 
import StaffLogin from "./StaffLogin"; 
import Waiter from "./waiter"; // Waiter component
import Kitchen from "./kitchen"; // Kitchen component
import "./App.css";

function App() {
  const [role, setRole] = useState(0); 
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 
  const [showPopup, setShowPopup] = useState(false);

  const validTables = ["101", "102", "103", "104", "201"];

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

  const totalAmount = Object.keys(cart).reduce((sum, itemName) => {
    const item = menuItems.find((menuItem) => menuItem.name === itemName);
    return sum + (parseFloat(item?.price || 0) * cart[itemName]);
  }, 0).toFixed(2);

  const handleTableNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); 
    if (value.length <= 3) {
      setTableNumber(value);
    }
  };

  const handlePlaceOrder = async () => {
    if (!tableNumber.trim()) {
      setErrorMessage("Please enter a table number before placing an order.");
      setShowPopup(true);
      return;
    }

    if (!validTables.includes(tableNumber)) {
      setErrorMessage("Invalid table number. This table number does not exist.");
      setShowPopup(true);
      return;
    }

    const orderData = {
      table_number: tableNumber,
      status: "pending",
      total_price: parseFloat(totalAmount),
      item_ids: Object.keys(cart).map(itemName => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return item?.id;
      })
    };

    const orderResponse = await createOrder(orderData);
    if (orderResponse) {
      setCart({});
      setOrders([...orders, orderResponse]);
      setTableNumber("");
      setErrorMessage("Order placed successfully!");
      setShowPopup(true);
    } else {
      setErrorMessage("Failed to place order. Please try again.");
      setShowPopup(true);
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
              <button className="staff-login" onClick={() => window.location.href = "/staff-login"}>Staff Login</button>
              {role === 0 && (
                <div className="menu-container">
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
                                  <button onClick={() => handleQuantityChange(item.name, "decrease")} className="counter-btn">-</button>
                                  <span>{cart[item.name]}</span>
                                  <button onClick={() => handleQuantityChange(item.name, "increase")} className="counter-btn">+</button>
                                </div>
                              ) : (
                                <button onClick={() => handleSelect(item.name)} className="select-button">Select</button>
                              )}
                            </div>
                          ) : (
                            <button onClick={() => handleSelect(item.name)} className="select-button">Select</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-summary">
                    <h4>Order Summary</h4>
                    <label>Enter Table Number:</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={handleTableNumberChange}
                      placeholder="Enter table number"
                      className="table-input"
                      maxLength="3"
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
                        
                        <div className="order-total">
                          <strong>Total: £{totalAmount}</strong>
                        </div>

                        <button onClick={handlePlaceOrder} className="order-button">Place Order</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {role === 1 && (
                <Waiter orders={orders} />  
              )}

              {role === 2 && (
                <Kitchen orders={orders} />  
              )}

            </>
          } />
        </Routes>

        {showPopup && (
          <div className="custom-popup">
            <div className="popup-content">
              <p>{errorMessage}</p>
              <button onClick={() => setShowPopup(false)}>OK</button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
