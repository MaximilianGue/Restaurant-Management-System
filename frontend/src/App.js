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
  // State to manage the selected role
  const [role, setRole] = useState(0);

  // Array of roles to display
  const roles = ["Customer", "Waiter", "Kitchen"];

  // Menu items with Mexican dishes
  const menuItems = [
    {
      category: "Starter",
      name: "Tacos",
      image: tacoImage,
      price: "9.99",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Starter",
      name: "Guacamole with Tortilla Chips",
      image: guacamoleImage,
      price: "6.50",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Burrito",
      image: burritoImage,
      price: "12.99",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Enchiladas",
      image: enchiladasImage,
      price: "14.99",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Quesadilla",
      image: quesadillaImage,
      price: "11.50",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Fajitas",
      image: fajitasImage,
      price: "16.00",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Chilaquiles",
      image: chilaquilesImage,
      price: "13.50",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Carnitas",
      image: carnitasImage,
      price: "15.00",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Mole Poblano",
      image: molePoblanoImage,
      price: "18.00",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Main",
      name: "Tamale",
      image: tamaleImage,
      price: "10.99",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Dessert",
      name: "Churros",
      image: churrosImage,
      price: "5.99",
      allergies: ["Gluten", "Dairy"]
    },
    {
      category: "Dessert",
      name: "Flan",
      image: flanImage,
      price: "4.99",
      allergies: ["Gluten", "Dairy"]
    }
  ];
  
  // Update the background color according to the role
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

  // Handler for slider input
  const handleSliderChange = (event) => {
    setRole(Number(event.target.value));
  };

  // Set dynamic color class for the selected role text
  const getRoleTextColor = () => {
    switch(role) {
      case 1:
        return "green-text"; // For waiter, text will be green
      case 2:
        return "orange-text"; // For kitchen, text will be orange
      default:
        return "";
    }
  };

  return (
    <div className="container">
      {/* Restaurant name */}
      <h1 className="restaurant-title">Oaxaca</h1>

      {/* Role selector */}
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
          <h3 >Selected Role: <span className={getRoleTextColor()}>{roles[role]}</span></h3>
        </div>
      </div>

      {/* Menu on the left */}
      <div className="menu-container">
        {role === 0 && (  // Show menu only if "Customer" (role 0) is selected
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
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;
