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
export const fetchMenuItem = async (menuItemId) => {
  try {
    const response = await api.get(
      `/menu-items/${menuItemId}/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting  menu item data:", error.response ? error.response.data : error.message);
    return null;
  }
};

// Fetch customers -- later on, when customer can have their own accounts for layalty rewards
export const fetchCustomers = async () => {
  try {
    const response = await api.get("/customers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};
export const fetchCustomer = async (customerId) => {
  try {
    const response = await api.get(
      `/order/${customerId}/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting  customer data:", error.response ? error.response.data : error.message);
    return null;
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

export const fetchTable = async (tableId) => {
  try {
    const response = await api.get(
      `/order/${tableId}/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting  table data:", error.response ? error.response.data : error.message);
    return null;
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

export const fetchOrder = async (orderId) => {
  try {
    const response = await api.get(
      `/orders/${orderId}/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting order data:", error.response ? error.response.data : error.message);
    return null;
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
      `/orders/${orderId}/update/`,
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
// Fetch waiters
export const fetchWaiters = async () => {
  try {
    const response = await api.get("/waiters/");
    return response.data;
  } catch (error) {
    console.error("Error fetching waiters data:", error);
    return [];
  }
};

export const fetchWaiter= async (waiterId) => {
  try {
    const response = await api.get(
      `/waiter/${waiterId}/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting waiter  data:", error.response ? error.response.data : error.message);
    return null;
  }
};
// Fetch KitchenStaff 
export const fetchKitchenStaff = async () => {
  try {
    const response = await api.get("/KitchenStaff/");
    return response.data;
  } catch (error) {
    console.error("Error fetching KitchenStaff:", error);
    return [];
  }
};

export const fetchKitchenstaffer = async (KitchenStaffId) => {
  try {
    const response = await api.get(
      `/KitchenStaff/${KitchenStaffId}/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting kitchen staffer  data:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const confirmOrder = async (orderId, confirmationStatus, staffId) => {
  try {
    const response = await api.put(
      `/orders/${orderId}/confirmation/`,
      {
        status: confirmationStatus,
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
    console.error(" Error conforming  Order:", error.response ? error.response.data : error.message);
    return null;
  }
};

