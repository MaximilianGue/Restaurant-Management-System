import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "./constants";
import { useState, useEffect } from "react";


/**
 * ProtectedRoute component
 * Ensures routes are only then accessible if user has a valid and not expired access token. (And automatically refreshes) 
 */
function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null); // null = loading state

    // Runs the authentication check on component mount
    useEffect(() => {
        auth().catch(() => setIsAuthorized(false));
    }, []);

    /** Attempts to refresh access token using the refresh token */
    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        if (!refreshToken) {
            setIsAuthorized(false);
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (res.status === 200) {
                const data = await res.json();
                localStorage.setItem(ACCESS_TOKEN, data.access);    // Save new access token
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            setIsAuthorized(false);
        }
    };

     /** Validatse the access token's expiration and refreshes if expired **/
    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorized(false);
            return;
        }

        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorized(true);
        }
    };

    // While checking authentication
    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    // If authorized, it renders protected content. If not it redirects you to the login.
    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
