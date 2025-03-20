import React, { useState } from "react";
import "./Dropdown.css"; 

const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusChoice, setStatusChoice] = useState("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button className="dropdown-button" onClick={toggleDropdown}>
        Select an option <i className={`fas fa-caret-${isOpen ? 'up' : 'down'}`}></i>
      </button>
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