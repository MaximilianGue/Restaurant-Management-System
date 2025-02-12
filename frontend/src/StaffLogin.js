import React from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css"; 

function StaffLogin({ setRole }) {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    setRole(role); // Update role state
    navigate("/"); // Redirect back to main page
  };

  return (
    <div className="staff-login-container">
      <h2>Select Staff Role</h2>
      <button className="staff-button waiter-button" onClick={() => handleRoleSelection(1)}>Waiter</button>
      <button className="staff-button kitchen-button" onClick={() => handleRoleSelection(2)}>Kitchen Staff</button>
      
      {/* Return to Customer View Button */}
      <button className="return-button" onClick={() => navigate("/")}>Return to Customer View</button>
    </div>
  );
}

export default StaffLogin;
