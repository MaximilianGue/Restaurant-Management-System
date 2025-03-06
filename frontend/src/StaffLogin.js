import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";
import { ACCESS_TOKEN, REFRESH_TOKEN,STAFF_ID } from "./constants";
function StaffLogin({ setRole }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/cafeApi/login/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(ACCESS_TOKEN, data.access_token);
                localStorage.setItem(REFRESH_TOKEN, data.refresh_token);
                localStorage.setItem(STAFF_ID, data.staff_id);

                // Fetch user list to determine role for this logged-in user
                const usersResponse = await fetch("http://127.0.0.1:8000/cafeApi/users/", {
                    headers: {
                        Authorization: `Bearer ${data.access_token}`,
                    },
                });

                if (!usersResponse.ok) {
                    throw new Error("Failed to fetch user data.");
                }

                const users = await usersResponse.json();
                const loggedInUser = users.find(user => user.username === username);

                if (!loggedInUser) {
                    throw new Error("User not found after login.");
                }

                // Set role and navigate based on role
                if (loggedInUser.role === "waiter") {
                    setRole(1);
                    navigate("/waiter");
                } else if (loggedInUser.role === "kitchen_staff") {
                    setRole(2);
                    navigate("/kitchen");
                } else {
                    setRole(0);
                    navigate("/");
                }
            } else {
                setErrorMessage(data.detail || "Invalid credentials");
                setShowPopup(true);
            }
        } catch (error) {
            setErrorMessage(error.message || "Login failed");
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
            <button className="staff-button register-button" onClick={() => navigate("/register")}>
                Register New Account
            </button>
            <button className="ret-button" onClick={() => {
                setRole(0);
                navigate("/");
            }}>Return to Customer View</button>

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
