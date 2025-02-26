import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";

function StaffLogin({ setRole }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    if ((username === "waiter" && password === "waiter") || (username === "kitchen" && password === "kitchen")) {
      setRole(username === "waiter" ? 1 : username === "kitchen" ? 2 : 3);
      navigate("/"+username);
    } else {
      setErrorMessage("Invalid username or password");
      setShowPopup(true);
    }
  };

  return (
    <div className="staff-login-container">
      <h2>Staff Login</h2>
      <input
        type="text"
        className="staff-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="staff-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="staff-button login-button" onClick={handleLogin}>
        Login
      </button>
      <button className="ret-button" onClick={() => {
          setRole(0);
          navigate("/");
        }}>Return to Customer View</button>
      {/* Popup Message */} 
      {showPopup && (
        <div className="custom-popup">
          <div className="popup-content">
            <p>{errorMessage}</p>
            <button onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffLogin;

