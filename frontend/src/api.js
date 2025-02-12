import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/cafeApi";  // Django API


const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch menu items
export const fetchMenuItems = async () => {
  try {
    const response = await api.get("/menu-items/");
    // Return the data as is, without modifying the image URL.
    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
};



// Fetch customers
export const fetchCustomers = async () => {
  try {
    const response = await api.get("/customers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

// Fetch orders
export const fetchOrders = async () => {
  try {
    const response = await api.get("/orders/");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// Create an order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders/", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};
