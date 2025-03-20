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


function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

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
  
function App() {
    const [role, setRole] = useState(0);
    const [hiddenItems, setHiddenItems] = useState([]);

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/home" element={<Home />} />
                
                {/* Protected Routes */}
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

                
                {/* Public Routes */}
                <Route path="/login" element={<StaffLogin setRole={setRole} />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/welcome" replace />} />  {/*Where the user is first directed to*/}
                <Route path="*" element={<NotFound />} />
                
            </Routes>
        </BrowserRouter>
    );
}

export default App;
