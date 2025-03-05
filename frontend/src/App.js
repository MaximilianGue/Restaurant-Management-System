import React, { useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import StaffLogin from "./StaffLogin";
import Waiter from "./waiter";
import Kitchen from "./kitchen";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./NotFound";
import Home from "./home";
import Register from "./Register";  

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function App() {
    const [role, setRole] = useState(0);
    const [hiddenItems, setHiddenItems] = useState([]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />

                {/* Protected Routes - Correct way */}
                <Route path="/waiter" 
                element={<ProtectedRoute
                ><Waiter setRole={setRole} hiddenItems={hiddenItems} setHiddenItems={setHiddenItems} />
                </ProtectedRoute>} />

                <Route
                    path="/kitchen"
                    element={
                        <ProtectedRoute>
                            <Kitchen setRole={setRole} />
                        </ProtectedRoute>
                    }
                />

                {/* Public Routes */}
                <Route path="/login" element={<StaffLogin setRole={setRole} />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
