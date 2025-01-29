import React, { useState, useEffect } from 'react';
import './App.css';

// Import images
import tacoImage from './assets/taco.jpg';
import guacamoleImage from './assets/nachos.jpg';
import burritoImage from './assets/burrito.jpg';
import enchiladasImage from './assets/enchiladas.jpg';
import quesadillaImage from './assets/quesadilla.jpg';
import fajitasImage from './assets/fajitas.jpg';
import churrosImage from './assets/churros.jpg';
import flanImage from './assets/flan.jpg';

function App() {
  const [role, setRole] = useState(0);
  const roles = ["Customer", "Waiter", "Kitchen"];

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
      case 1: return "green-text";
      case 2: return "orange-text";
      default: return "";
    }
  };

  const menuItems = [
    { category: "Starters", name: "Tacos", image: tacoImage, price: "9.99", allergies: ["Gluten", "Dairy"] },
    { category: "Starters", name: "Guacamole with Tortilla Chips", image: guacamoleImage, price: "6.50", allergies: ["Gluten"] },
    { category: "Mains", name: "Burrito", image: burritoImage, price: "12.99", allergies: ["Gluten", "Dairy"] },
    { category: "Mains", name: "Enchiladas", image: enchiladasImage, price: "14.99", allergies: ["Dairy"] },
    { category: "Mains", name: "Quesadilla", image: quesadillaImage, price: "11.50", allergies: ["Gluten", "Dairy"] },
    { category: "Mains", name: "Fajitas", image: fajitasImage, price: "16.00", allergies: [] },
    { category: "Desserts", name: "Churros", image: churrosImage, price: "5.99", allergies: ["Gluten", "Dairy"] },
    { category: "Desserts", name: "Flan", image: flanImage, price: "4.99", allergies: ["Dairy"] },
  ];

  return (
    <div className="container">
      <h1 className="restaurant-title">Oaxaca</h1>

      {/* Role Selector */}
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

      {/* Display menu only for Customer */}
      {role === 0 && (
        <div className="menu">
          <h3>Menu</h3>

          {["Starters", "Mains", "Desserts"].map((category) => (
            <div className="menu-category" key={category}>
              <h4>{category}</h4>
              <div className="menu-grid">
                {menuItems.filter(item => item.category === category).map((item, index) => (
                  <div className="menu-item" key={index}>
                    <img src={item.image} alt={item.name} className="menu-item-image" />
                    <div className="menu-item-details">
                      <h4>{item.name}</h4>
                      <p className="price">£{item.price}</p>
                      <p><strong>Allergens:</strong> {item.allergies.length > 0 ? item.allergies.join(", ") : "None"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default App;
