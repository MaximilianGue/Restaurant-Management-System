import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [role, setRole] = useState(0);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);

  const roles = ["Customer", "Waiter", "Kitchen"];

  // Fetch menu items from API and use API-provided images
  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/cafeApi/menu-items/");
      if (!response.ok) throw new Error("Failed to fetch");

      let data = await response.json();
      console.log("API Response:", data);

      if (!Array.isArray(data)) {
        console.error("API response is not an array:", data);
        return;
      }

      // Use API-provided image or fallback to default image
      const menuWithImages = data.map(item => ({
        ...item,
        image: item.image || "/default-image.jpg", // Provide a default image
      }));

      console.log("Processed Menu Items:", menuWithImages);
      setMenuItems(menuWithImages);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  }, []);

  // Fetch menu items when the component mounts
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Send menu items to backend
  const sendDataToBackend = async () => {
    for (const item of menuItems) {
      try {
        const response = await fetch("http://127.0.0.1:8000/cafeApi/menu-items/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            price: item.price,
            allergies: item.allergies, 
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error adding ${item.name}: ${errorText}`);
        }
      } catch (error) {
        console.error("Error sending data:", error);
      }
    }
    fetchMenuItems(); // Refresh menu after sending data
  };

  // Handle role switching
  useEffect(() => {
    if (role === 1) {
      document.body.classList.add("waiter");
      document.body.classList.remove("kitchen");
    } else if (role === 2) {
      document.body.classList.add("kitchen");
      document.body.classList.remove("waiter");
    } else {
      document.body.classList.remove("waiter", "kitchen");
    }
  }, [role]);

  const handleSliderChange = (event) => {
    setRole(Number(event.target.value));
  };

  const getRoleTextColor = () => {
    switch (role) {
      case 1:
        return "green-text"; 
      case 2:
        return "orange-text"; 
      default:
        return "";
    }
  };

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

  const getOrderSummary = () => {
    let totalPrice = 0;
    return Object.keys(cart).map((itemName) => {
      const item = menuItems.find((menuItem) => menuItem.name === itemName);
      if (item) {
        const itemTotal = parseFloat(item.price) * cart[itemName];
        totalPrice += itemTotal;
        return (
          <div key={itemName} className="order-summary-item">
            <span>{itemName} x{cart[itemName]}: </span>
            <span>£{itemTotal.toFixed(2)}</span>
          </div>
        );
      }
      return null;
    }).concat(
      <div key="total" className="order-summary-total">
        <span>Total: </span>
        <span>£{totalPrice.toFixed(2)}</span>
      </div>
    );
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
            <span>Customer</span>
            <span>Waiter</span>
            <span>Kitchen</span>
          </div>
        </div>
        <div className="selected-role">
          <h3>
            Selected Role: <span className={getRoleTextColor()}>{roles[role]}</span>
          </h3>
        </div>
      </div>

      <div className="menu-container">
        {role === 0 && (
          <div className="menu">
            <h3>Menu:</h3>

            {menuItems.length === 0 ? (
              <p>Loading menu items...</p>
            ) : (
              ["Starter", "Main", "Dessert"].map((category) => (
                <div className="menu-category" key={category}>
                  <h4>{category}</h4>
                  <div className="menu-grid">
                    {menuItems
                      .filter(item => item.category === category)
                      .map((item, index) => (
                        <div className="menu-item" key={index}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="menu-item-image"
                          />
                          <div className="menu-item-details">
                            <h4>{item.name}</h4>
                            <p className="price">£{item.price}</p>
                            <p>
                              <strong>Potential Allergies:</strong>{" "}
                              {item.allergies && item.allergies.length > 0
                                ? item.allergies.join(", ")
                                : "None"}
                            </p>
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
                      ))}
                  </div>
                </div>
              ))
            )}

            <div className="order-summary">
              <h4>Order Summary</h4>
              {getOrderSummary()}
            </div>

            <button onClick={sendDataToBackend} className="send-button">
              Send Menu to Backend
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
