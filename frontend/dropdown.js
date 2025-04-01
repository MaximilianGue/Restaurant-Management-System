import React, { useState } from "react";
import "./styles/Dropdown.css"; 

/**
 * The dropdown component for status selection
 * Allows user to choose from following states: Pending, Completed or even Canceled
 */
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusChoice, setStatusChoice] = useState("");

   /**
   * Toggles the visibility of the dropdown
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      {/* Toggle button for dropdown*/}
      <button className="dropdown-button" onClick={toggleDropdown}>
        Select an option <i className={`fas fa-caret-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      {/* Dropdown content is only visible while open */}
      {isOpen && (
        <div className="dropdown-content"> 
          <a><i className="PendingDropdown" onClick={setStatusChoice("Pending")} ></i> Pending</a>
          <a><i className="CompletedDropdown" onClick={setStatusChoice("Completed")} ></i> Completed</a>
          <a><i className="CanceledDropdown" onClick={setStatusChoice("Canceled")} ></i> Canceled</a>
        </div>
      )}
    </div>
  );
};

export default Dropdown;