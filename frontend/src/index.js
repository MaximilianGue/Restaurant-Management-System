/**
 * Entry point for the entire React application.
 * Renders App component into root div in index.html.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Creates root and render App inside React.StrictMode
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
