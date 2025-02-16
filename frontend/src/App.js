import React, { useState, useEffect } from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchMenuItems, fetchOrders, createOrder } from "./api"; 
import StaffLogin from "./StaffLogin";
import "./App.css";

function App() {
  const [role, setRole] = useState(0);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [loadingTables, setLoadingTables] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const items = await fetchMenuItems();
      setMenuItems(items || []);

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

  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      alert("Please select a table before placing an order.");
      return;
    }

    const orderData = {
      table_id: selectedTable,
      status: "pending",
      total_price: Object.keys(cart).reduce((sum, itemName) => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return sum + (parseFloat(item.price) * cart[itemName]);
      }, 0),
      item_ids: Object.keys(cart).map((itemName) => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return item.id;
      }),
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
                  <h3 className="menu-heading">Menu</h3>
                  <div className="menu-grid">
                    {menuItems.map((item, index) => (
                      <div className="menu-item" key={index}>
                        <img src={item.image} alt={item.name} className="menu-item-image" onError={(e) => e.target.src = "/fallback-image.jpg"} />
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
                    ))}
                  </div>
                  <div className="order-summary">
                    <h4>Order Summary</h4>
                    <select onChange={(e) => setSelectedTable(e.target.value)} disabled={tables.length === 0}>
                      <option value="">-- Select Table --</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>Table {table.number} (Waiter: {table.waiter_name || "None"})</option>
                      ))}
                    </select>
                    {Object.keys(cart).length > 0 && (
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
                    )}
                  </div>
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
