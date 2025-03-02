import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import { fetchMenuItems, fetchOrders, createOrder } from "./api";
import StaffLogin from "./StaffLogin";
import Waiter from "./waiter";
import Kitchen from "./kitchen";
import "./App.css";

function App() {
  const [role, setRole] = useState(0);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [filter, setFilter] = useState("All");
  
  useEffect(() => {
    setRole(0); // Set role to customer when the "/" route is loaded
    const loadData = async () => {
      const items = await fetchMenuItems();
      setMenuItems(items || []);
      const ordersData = await fetchOrders();
      setOrders(ordersData || []);
    };
    loadData();
  }, []);

  useEffect(() => {
    document.body.classList.remove("waiter", "kitchen", "customer");
    if (role === 0) document.body.classList.add("customer");
    if (role === 1) document.body.classList.add("waiter");
    if (role === 2) document.body.classList.add("kitchen");
  }, [role]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/cafeApi/tables/");
        const tableData = await response.json();
        setTables(tableData || []);
      } catch (error) {
        console.error("Error fetching tables:", error);
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, []);

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

  const totalAmount = Object.keys(cart)
    .reduce((sum, itemName) => {
      const item = menuItems.find((menuItem) => menuItem.name === itemName);
      return sum + (parseFloat(item?.price || 0) * cart[itemName]);
    }, 0)
    .toFixed(2);

  const handleTableNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setTableNumber(value ? parseInt(value, 10) : ""); // Ensure valid number or empty string
  
    
    if (value.length <= 3) {
      setTableNumber(value);
    }
  };

  const handlePlaceOrder = async () => {
    const tableNum = parseInt(tableNumber, 10); // Convert input to an integer

    if (isNaN(tableNum)) {
      setErrorMessage("Please enter a valid table number.");
      setShowPopup(true);
      return;
    }

    // Validate if the table exists
    if (!tables.some((table) => table.number === tableNum)) {
      setErrorMessage("Invalid table number. This table number does not exist.");
      setShowPopup(true);
      return;
    }

    const orderData = {
      table_id: tableNumber,
      table_number: tableNumber,
      status: "pending",
      total_price: parseFloat(totalAmount),
      item_ids: Object.keys(cart).map((itemName) => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return item?.id;
      }),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/cafeApi/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": "true", // Allow credentials
        },
        body: JSON.stringify(orderData),
        credentials: "include", // Include credentials if you're sending cookies
      });
      

      if (response.ok) {
        const orderResponse = await response.json();
        setCart({});
        setOrders([...orders, orderResponse]);
        //setTableNumber("");
        setErrorMessage("Order placed successfully!");
        setShowPopup(true);
      } else {
        const errorDetails = await response.text(); // Log detailed error message
        console.error("Response error:", errorDetails);
        setErrorMessage("Failed to place order. Please try again.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setErrorMessage(`Error placing order: ${error.message || "Unknown error"}`);
      setShowPopup(true);
    }
  };

  const handleCallWaiter = () => {
    const tableNum = parseInt(tableNumber, 10); // Convert input to an integer

    if (isNaN(tableNum)) {
      setErrorMessage("Please enter a valid table number.");
      setShowPopup(true);
      return;
    }

    // Validate if the table exists
    if (!tables.some((table) => table.number === tableNum)) {
      setErrorMessage("Invalid table number. This table number does not exist.");
      setShowPopup(true);
      return;
    }

    // If valid, proceed with calling the waiter
    setErrorMessage("Waiter has been called to your table!");
    setShowPopup(true);
  };

  const handleFilterChange = (category) => {
    setFilter(category);
  };

  const filteredMenuItems =
  filter === "All"
    ? menuItems
    : menuItems.filter((item) =>
        item.category.includes(filter) // Check if filter is in the item.category list
      );




  return (
 
      <div className="container">
        <h1 className="restaurant-title">Oaxaca</h1>

        <Routes>
          <Route path="/staff-login" element={<StaffLogin setRole={setRole} />} />

          <Route
            path="/"
            
            element={
              <>
              
              <button className="staff-login" onClick={() => (window.location.href = "/staff-login")}>
                Staff Login
              </button>

              <div className="filter-container">
                {["All", "Main Course", "Non-Vegetarian", "Appetizer", "Vegetarian", "Gluten-Free", "Breakfast", "Dessert"].map((category) => (
                  <button key={category} onClick={() => handleFilterChange(category)} className="filter-button">
                    {category}
                  </button>
                ))}
              </div>

                <button className="staff-login" onClick={() => (window.location.href = "/staff-login")}>
                  Staff Login
                </button>

                {(
                  <div className="menu-container">
                    <div className="menu-grid">
                      {filteredMenuItems.length > 0 ? (filteredMenuItems.map((item, index) => (
                          <div className="menu-item" key={index}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className="menu-item-image"
                              onError={(e) => (e.target.src = "/fallback-image.jpg")}
                            />
                            <div className="menu-item-details">
                              <h4>{item.name}</h4>
                              <p className="price">£{item.price}</p>
                              <p><strong>Allergies:</strong> {item.allergies.join(", ")} </p>
                              <p><strong>Calories</strong> {item.calories}</p>

                              {cart[item.name] ? (
                                <div className="counter">
                                  <button onClick={() => handleQuantityChange(item.name, "decrease")} className="counter-btn">
                                    -
                                  </button>
                                  <span>{cart[item.name]}</span>
                                  <button onClick={() => handleQuantityChange(item.name, "increase")} className="counter-btn">
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => handleSelect(item.name)} className="select-button">
                                  Select
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>Loading menu.../No items available in this category...</p>
                      )}
                    </div>

                    <div className="order-summary">
                      <label>Enter Table Number:</label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={handleTableNumberChange} 
                        
                        placeholder="e.g. 001"
                        className="table-input"
                        maxLength="3"
                      />
                      <button onClick={handleCallWaiter} className="call-waiter-btn">
                        Call Waiter
                      </button>

                      <h4>Order Summary</h4>

                      {Object.keys(cart).length > 0 ? (
                        <>
                          {Object.keys(cart).map((itemName) => {
                            const item = menuItems.find((menuItem) => menuItem.name === itemName);
                            return (
                              <div key={itemName} className="order-summary-item">
                                <span>
                                  {itemName} x{cart[itemName]}
                                </span>
                                <span>£{(parseFloat(item.price) * cart[itemName]).toFixed(2)}</span>
                              </div>
                            );
                          })}

                          <div className="order-summary-total">
                            <span>Total</span>
                            <span>£{totalAmount}</span>
                          </div>

                          <button onClick={handlePlaceOrder} className="order-button">
                            Place Order
                          </button>
                        </>
                      ) : (
                        <p>Your cart is empty</p>
                      )}
             
              

                    <h4>Placed Orders</h4>

                      <div className="placed-orders-container">
                        {orders.length === 0 ? (
                          <p>No orders placed for this table.</p>
                        ) : (
                          orders
                            .filter((order) => order.table_id === parseInt(tableNumber, 10)) // Corrected filter
                            .map((order) => (
                              <div key={order.id} className="placed-order">
                                <p>Order #{order.id}</p>
                                <p>Status: {order.status}</p>
                                <p>Total: £{order.total_price}</p>
                              </div>
                            ))

                        )}

                      </div>
                    </div>
                    
                  </div>
                )}
              </>
            }
          />

          {/* Add your other Routes for Waiter and Kitchen pages */}

          <Route path="/waiter" element={<Waiter setRole={setRole} />} />
          <Route
            path="/"
              
          />
          <Route path="/kitchen" element={<Kitchen setRole={setRole} />} />
          <Route
            path="/"
              
          />

        </Routes>
          
        {/* Popup for messages */}
        {showPopup && (
          <div className="custom-popup">
            <p>{errorMessage}</p>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        )}
      </div>

  );
}

export default App;
