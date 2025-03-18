import React, { useState, useEffect } from "react";
import { fetchMenuItems, fetchOrders, createOrder,fetchStaffIdForTable,callWaiter } from "./api";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./home.css";

function Home() {
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
  const navigate = useNavigate();
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
    const tableNum = parseInt(tableNumber, 10);
    const staffId = await fetchStaffIdForTable(tableNum);
    if (isNaN(tableNum)) {
        setErrorMessage("Please enter a valid table number.");
        setShowPopup(true);
        return;
    }

    if (!tables.some((table) => table.number === tableNum)) {
        setErrorMessage("Invalid table number. This table number does not exist.");
        setShowPopup(true);
        return;
    }
   
    const orderData = {
        table_number: tableNumber,
        status: "pending",
        total_price: parseFloat(totalAmount),
        Staff_id : staffId,
        items: Object.keys(cart).map((itemName) => {
            const item = menuItems.find((menuItem) => menuItem.name === itemName);
            return {
                item_id: item?.id,
                quantity: cart[itemName]  // Track quantity directly
            };
        }),
    };

    try {
        const response = await createOrder(orderData); 

        if (response) {
            setCart({});
            setOrders([...orders, response]);
            setErrorMessage("Order placed successfully!");
            setShowPopup(true);
        } else {
            setErrorMessage("Failed to place order. Please try again.");
            setShowPopup(true);
        }
    } catch (error) {
        console.error("Error placing order:", error);
        setErrorMessage(`Error placing order: ${error.message || "Unknown error"}`);
        setShowPopup(true);
    }
};


const handleCallWaiter = async () => {
  const tableNum = parseInt(tableNumber, 10);
  if (isNaN(tableNum)) {
      setErrorMessage("Please enter a valid table number.");
      setShowPopup(true);
      return;
  }

  if (!tables.some((table) => table.number === tableNum)) {
      setErrorMessage("Invalid table number. This table number does not exist.");
      setShowPopup(true);
      return;
  }

  // Step 1: Fetch waiter staff_id for the table
  const staffId = await fetchStaffIdForTable(tableNum);
  if (!staffId) {
      setErrorMessage("No waiter is assigned to this table.");
      setShowPopup(true);
      return;
  }

  // Step 2: Find the most recent order for this table (assuming orders is already loaded)
  const tableOrders = orders.filter(order => order.table_id === tableNum);
  if (tableOrders.length === 0) {
      setErrorMessage("No orders found for this table. Cannot call waiter.");
      setShowPopup(true);
      return;
  }

  // Get latest order by order date (or by highest ID if dates not reliable)
  const latestOrder = tableOrders[tableOrders.length - 1];

  // Step 3: Call the waiter using the latest order ID
  const response = await callWaiter(staffId, latestOrder.id,"","waiter_call");

  if (response) {
      setErrorMessage("Waiter has been called successfully!");
  } else {
      setErrorMessage("Failed to call waiter. Please try again.");
  }

  setShowPopup(true);
};


  const handleFilterChange = (category) => {
    setFilter(category);
  };

  const filteredMenuItems =
  filter === "All"
    ? menuItems
    : menuItems.filter((item) => {
        if (Array.isArray(item.category)) {
          return item.category.includes(filter); // If category is an array
        }
        return item.category.toLowerCase() === filter.toLowerCase(); // If category is a string
      });





  return (
 
      <div className="container">
        <h1 className="restaurant-title">Oaxaca</h1>
        <div className="filter-container">
          {["All", "Main Course", "Non-Vegetarian", "Appetizer", "Vegetarian", "Gluten-Free", "Breakfast", "Dessert", "Drinks"].map((category) => (
            <button 
              key={category} 
              onClick={() => handleFilterChange(category)} 
              className={`filter-button ${filter === category ? "active" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>


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
                              <p><strong>Allergies:</strong> {Array.isArray(item.allergies) ? item.allergies.join(", ") : item.allergies} </p>

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
                      Scroll to see all your orders
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

export default Home;
