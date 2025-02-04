import React, { useState, useEffect } from 'react';
import './App.css';

// image file imports
import tacoImage from './assets/taco.jpg';
import guacamoleImage from './assets/nachos.jpg';
import burritoImage from './assets/burrito.jpg';
import enchiladasImage from './assets/enchiladas.jpg';
import quesadillaImage from './assets/quesadilla.jpg';
import fajitasImage from './assets/fajitas.jpg';
import chilaquilesImage from './assets/chilaquiles.jpg';
import carnitasImage from './assets/carnitas.jpg';
import molePoblanoImage from './assets/mole-poblano.jpg';
import tamaleImage from './assets/tamale.jpg';
import churrosImage from './assets/churros.jpg';
import flanImage from './assets/flan.jpg';

function App() {
  const [role, setRole] = useState(0);
  const [cart, setCart] = useState({});

  const roles = ["Customer", "Waiter", "Kitchen"];

  const menuItems = [
    { category: "Starter", name: "Tacos", image: tacoImage, price: "9.99", allergies: ["Gluten", "Dairy"] },
    { category: "Starter", name: "Nachos", image: guacamoleImage, price: "6.50", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Burrito", image: burritoImage, price: "12.99", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Enchiladas", image: enchiladasImage, price: "14.99", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Quesadilla", image: quesadillaImage, price: "11.50", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Fajitas", image: fajitasImage, price: "16.00", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Chilaquiles", image: chilaquilesImage, price: "13.50", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Carnitas", image: carnitasImage, price: "15.00", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Mole Poblano", image: molePoblanoImage, price: "18.00", allergies: ["Gluten", "Dairy"] },
    { category: "Main", name: "Tamale", image: tamaleImage, price: "10.99", allergies: ["Gluten", "Dairy"] },
    { category: "Dessert", name: "Churros", image: churrosImage, price: "5.99", allergies: ["Gluten", "Dairy"] },
    { category: "Dessert", name: "Flan", image: flanImage, price: "4.99", allergies: ["Gluten", "Dairy"] }
  ];

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

      // If the quantity is less than 1, we remove the item from the cart
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
            <span>£{(itemTotal).toFixed(2)}</span>
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

  const confirmTopOrder = (event) => {
    var x = document.getElementById("placedOrders");
    try {
      x.deleteRow(0);
    } catch(err) {};
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

      {/* Customer Page */}
      <div className="menu-container"> 
        {role === 0 && (
          <div className="menu">
            <h3>Menu:</h3>

            {/* Starters Section */}
            <div className="menu-category">
              <h4>Starters</h4>
              <div className="menu-grid">
                {menuItems.filter(item => item.category === "Starter").map((item, index) => (
                  <div className="menu-item" key={index}>
                    <img src={item.image} alt={item.name} className="menu-item-image" />
                    <div className="menu-item-details">
                      <h4>{item.name}</h4>
                      <p className="price">£{item.price}</p>
                      <p><strong>Potential Allergies:</strong></p>
                      <ul>
                        {item.allergies.map((allergy, idx) => (
                          <li key={idx}>{allergy}</li>
                        ))}
                      </ul>

                      {/* Display counter if selected */}
                      {cart[item.name] ? (
                        <div className="counter">
                          <button
                            onClick={() => handleQuantityChange(item.name, "decrease")}
                            className="counter-btn"
                          >-</button>
                          <span>{cart[item.name]}</span>
                          <button
                            onClick={() => handleQuantityChange(item.name, "increase")}
                            className="counter-btn"
                          >+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelect(item.name)}
                          className="select-button"
                        >Select</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mains Section */}
            <div className="menu-category">
              <h4>Mains</h4>
              <div className="menu-grid">
                {menuItems.filter(item => item.category === "Main").map((item, index) => (
                  <div className="menu-item" key={index}>
                    <img src={item.image} alt={item.name} className="menu-item-image" />
                    <div className="menu-item-details">
                      <h4>{item.name}</h4>
                      <p className="price">£{item.price}</p>
                      <p><strong>Potential Allergies:</strong></p>
                      <ul>
                        {item.allergies.map((allergy, idx) => (
                          <li key={idx}>{allergy}</li>
                        ))}
                      </ul>

                      {/* Display counter if selected */}
                      {cart[item.name] ? (
                        <div className="counter">
                          <button
                            onClick={() => handleQuantityChange(item.name, "decrease")}
                            className="counter-btn"
                          >-</button>
                          <span>{cart[item.name]}</span>
                          <button
                            onClick={() => handleQuantityChange(item.name, "increase")}
                            className="counter-btn"
                          >+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelect(item.name)}
                          className="select-button"
                        >Select</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desserts Section */}
            <div className="menu-category">
              <h4>Desserts</h4>
              <div className="menu-grid">
                {menuItems.filter(item => item.category === "Dessert").map((item, index) => (
                  <div className="menu-item" key={index}>
                    <img src={item.image} alt={item.name} className="menu-item-image" />
                    <div className="menu-item-details">
                      <h4>{item.name}</h4>
                      <p className="price">£{item.price}</p>
                      <p><strong>Potential Allergies:</strong></p>
                      <ul>
                        {item.allergies.map((allergy, idx) => (
                          <li key={idx}>{allergy}</li>
                        ))}
                      </ul>

                      {/* Display counter if selected */}
                      {cart[item.name] ? (
                        <div className="counter">
                          <button
                            onClick={() => handleQuantityChange(item.name, "decrease")}
                            className="counter-btn"
                          >-</button>
                          <span>{cart[item.name]}</span>
                          <button
                            onClick={() => handleQuantityChange(item.name, "increase")}
                            className="counter-btn"
                          >+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelect(item.name)}
                          className="select-button"
                        >Select</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <h4>Order Summary</h4>
              {getOrderSummary()}
            </div>
          </div>
        )}
      </div>
      
      {/* Waiter Page */}
      <div className="Waiter-container">
        {role === 1 && (
          <div className="waiter">
            <h3>Waiter Page:</h3>
            <table id="placedOrders">
              <tr>
                <td>Order #1</td>
                <td>Tacos x1, Nachos x2, Burrito x1</td>
                <td>£35.98</td>
              </tr>
              <tr>
                <td>Order #2</td>
                <td>Enchiladas x3, Mole Poblano x1, Churros x2</td>
                <td>£74.98</td>
              </tr>
            </table>

            <button onClick={confirmTopOrder}>Confirm Top Order</button>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
