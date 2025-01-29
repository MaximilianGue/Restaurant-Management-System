import React, { useState, useEffect } from 'react';
import './App.css';

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
    switch(role) {
      case 1: return "green-text"; 
      case 2: return "orange-text"; 
      default: return "";
    }
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
    </div>
  );
}

export default App;
