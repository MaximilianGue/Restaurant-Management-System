import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";

function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("waiter");  // Default to waiter
    const [staffID, setStaffID] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleRegister = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/cafeApi/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    password,
                    role,
                    staff_id: staffID,
                }),
            });

            if (response.ok) {
                navigate("/login");
            } else {
                const data = await response.json();
                setErrorMessage(data.detail || "Registration failed");
                setShowPopup(true);
            }
        } catch (error) {
            setErrorMessage("Error occurred during registration.");
            setShowPopup(true);
        }
    };

    return (
        <div className="staff-login-container">
            <h2>Staff Registration</h2>
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
            <input
                type="text"
                className="staff-input"
                placeholder="Staff ID"
                value={staffID}
                onChange={(e) => setStaffID(e.target.value)}
            />
            <select
                className="staff-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="waiter">Waiter</option>
                <option value="kitchen_staff">Kitchen Staff</option>
                <option value="manager">Manager</option>
            </select>
            <button className="staff-button register-button" onClick={handleRegister}>
                Register
            </button>
            <button className="ret-button" onClick={() => navigate("/login")}>
                Back to Login
            </button>

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

export default Register;
