import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import StaffLogin from "./StaffLogin";
import Waiter from "./waiter";
import Kitchen from "./kitchen";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./NotFound";
import Home from "./home";
import Register from "./Register";
import Welcome from "./welcome"
import Manager from "./manager"

/**
 * Clears the local storage to log user out and redirect to login page
 */
function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

/**
 * The navigation bar, which is displayed on top of all pages
 */
function Navbar() {
    return (
      <nav style={{ padding: "1rem", background: "#333", color: "white", width: "100%", position: "fixed", top: 0, left: 0 }}>
        <ul style={{ display: "flex", listStyle: "none", gap: "1rem", padding: 0, margin: 0, justifyContent: "center", width: "100%" }}>
          <li><Link to="/welcome" style={{ color: "white", textDecoration: "none" }}>Welcome</Link></li>
          <li><Link to="/home" style={{ color: "white", textDecoration: "none" }}>Home</Link></li>
          <li><Link to="/login" style={{ color: "white", textDecoration: "none" }}>Staff Login</Link></li>
        </ul>
      </nav>
    );
  }

/**
 * The main App component with routes
 */
function App() {
    const [role, setRole] = useState(0);
    const [hiddenItems, setHiddenItems] = useState([]);

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public Pages */}
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/home" element={<Home />} />
                
                {/* Protected Routes (only accessible after login) */}
                <Route 
                    path="/waiter" 
                    element={
                        <ProtectedRoute>
                            <Waiter setRole={setRole} hiddenItems={hiddenItems} setHiddenItems={setHiddenItems} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/kitchen" 
                    element={
                        <ProtectedRoute>
                            <Kitchen setRole={setRole} />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/manager" 
                    element={
                        <ProtectedRoute>
                            <Manager setRole={setRole} />
                        </ProtectedRoute>
                    } 
                />

                
                {/* The authentifcation and registration Routes */}
                <Route path="/login" element={<StaffLogin setRole={setRole} />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<Register />} />

                {/* The default and fallback routes */}
                <Route path="/" element={<Navigate to="/welcome" replace />} />  {/*Where the user is first directed to*/}
                <Route path="*" element={<NotFound />} />
                
            </Routes>
        </BrowserRouter>
    );
}

export default App;
