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

// Fetch tables 
export const fetchTables = async () => {
  try {
    const response = await api.get("/tables/");
    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
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

// Create an order (Now uses `table_id` instead of `customer`)
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders/", orderData);
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const updateOrderStatus = async (orderId, orderStatus, staffId) => {
  try {
    const response = await api.put(
      `/order/${orderId}/update/`,
      {
        status: orderStatus,
        Staff_id: staffId, 
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Response Data:", response.data);
    return response.data.status;
  } catch (error) {
    console.error(" Error Updating Order:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(
      `/orders/${orderId}/`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Response Data:", response.data);
    return response.data.status;
  } catch (error) {
    console.error(" Error Cancelling Order:", error.response ? error.response.data : error.message);
    return null;
  }
}