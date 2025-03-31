import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";

/**
 * Staff registration form
 * Allows staff (waiter, kitchen staff, or manager) to register an account
 */
function Register() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("waiter");  // Defaults to waiter
    const [staffID, setStaffID] = useState("");

    // Error handling
    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    /**
     * Handles registration logic
     * It sends a POST request to backend with the registration data
     */
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
            // If successful redirect to login page
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

            {/* Username input */}
            <input
                type="text"
                className="staff-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            {/* Password input */}
            <input
                type="password"
                className="staff-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {/* Staff Id input */}
            <input
                type="text"
                className="staff-input"
                placeholder="Staff ID"
                value={staffID}
                onChange={(e) => setStaffID(e.target.value)}
            />
            {/* Role input by roleselector */}
            <select
                className="staff-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="waiter">Waiter</option>
                <option value="kitchen_staff">Kitchen Staff</option>
                <option value="manager">Manager</option>
            </select>
            {/* Register button */}
            <button className="staff-button register-button" onClick={handleRegister}>
                Register
            </button>
            {/* Back to the login button */}
            <button className="ret-button" onClick={() => navigate("/login")}>
                Back to Login
            </button>

            {/* Popup message if an error occurs */}
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
