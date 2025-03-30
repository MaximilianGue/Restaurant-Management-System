import axios from "axios"; 

const BASE_URL = "http://127.0.0.1:8000/cafeApi";  

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
    return response.data;  // This is the correct pattern.
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    return null;  // Just return `null` to indicate failure. Don't try to set errors here.
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

export const fetchAvailability = async (menuItemId) => {
  try {
    const response = await api.get(`menu-item/${menuItemId}/availability/`);

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error getting availability data:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const updateAvailability = async (menuItemId,availabilityNum) => {
  try {
    const response = await api.put(
      `menu-item/${menuItemId}/update-availability/`,
      {
        availability: availabilityNum,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error updating availability data:", error.response ? error.response.data : error.message);
    return null;
  }
};

export const callWaiter = async (staffId,orderId,messages,type) => {
  try {
    const response = await api.post(
      `/notifications/notify_waiter/`,
      {
        Staff_id: staffId,
        order_id:orderId,
        message :messages,
        notification_type :type

      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(error.response);
    return null;
  }
};

export const notifyStaff = async (staffId,target,messages,tableNumber) => {
  try {
    const response = await api.post(
      `/notifications/notify_staff/`,
      {
        Staff_id: staffId,
        target_staff_id:target,
        message :messages,
        table_number:tableNumber
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error alerting staff :", error.response ? error.response.data : error.message);
    return null;
  }
};

export const fetchWaiterDetails = async (staffId) => {
  try {
    const response = await api.get(`/waiters/${staffId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching waiter details:", error.response ? error.response.data : error.message);
    return null;
  }
};

// Fetch staff_id for a given table number
export const fetchStaffIdForTable = async (tableNumber) => {
  try {
    const response = await api.get(`/tables/${tableNumber}/staff_id/`);
    return response.data.staff_id;
  } catch (error) {
    console.error(`Error fetching staff ID for table ${tableNumber}:`, error.response ? error.response.data : error.message);
    return null;
  }
};

export const fetchNotificationsForStaff = async (staffId) => {
  try {
    const response = await api.get(`/notifications/?staff_id=${staffId}`);
    return response.data;  // Expect list of notifications sorted by `created_at` desc
  } catch (error) {
    console.error("Error fetching notifications for staff:", error.response ? error.response.data : error.message);
    return [];
  }
};




export const deleteMenuItem = async (id) => {
  try {
      const response = await fetch(`http://127.0.0.1:8000/cafeApi/menu-items/${id}/`, {
          method: "DELETE",
          headers: {
              "Content-Type": "application/json",
          },
      });

      if (!response.ok) {
          throw new Error(`Failed to delete item. Server responded with status: ${response.status}`);
      }

      return true; // Return true on successful deletion
  } catch (error) {
      console.error("Error deleting menu item:", error);
      return false; // Return false if there's an error
  }
};


export const addMenuItem = async (menuItemData) => {
  try {
      const response = await api.post("/menu-items/", menuItemData, {
          headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
  } catch (error) {
      console.error("Error adding menu item:", error.response?.data || error.message);
      return null;
  }
};

export const updateMenuItem = async (menuItemId, menuItemData) => {
  try {
      const response = await api.patch(`/menu-items/${menuItemId}/`, menuItemData, {
          headers: {
              "Content-Type": "multipart/form-data", 
          },
      });

      return response.data;
  } catch (error) {
      console.error("Error updating menu item:", error.response?.data || error.message);
      return null;
  }
};

// Create Stripe Checkout Session
export const createCheckoutSession = async (paymentId) => {
  try {
    const response = await api.post(`/payments/${paymentId}/checkout/`);
    console.log("Checkout Session URL:", response.data.checkout_url);
    return response.data.checkout_url;
  } catch (error) {
    console.error("Error creating checkout session:", error.response?.data || error.message);
    return null;
  }
};

// Verify Payment Status
export const verifyPayment = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/verify/`);
    return response.status;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return null;
  }
};

// Cancel Payment
export const cancelPayment = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/cancel/`);
    return response.status;
  } catch (error) {
    console.error("Error canceling payment:", error.response?.data || error.message);
    return null;
  }
};

// Get Sales Per Waiter (successful payments and total sales)
export const getSalesPerWaiter = async (staffId) => {
  try {
    const response = await api.get(`/sales/${staffId}/`);
    console.log("Sales Per Waiter Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching sales per waiter:", error.response?.data || error.message);
    return null;
  }
};


export const fetchEmployees = async () => {
  try {
      const response = await axios.get("http://127.0.0.1:8000/cafeApi/employees/");
      return response.data;  // This will return the updated list of employees
  } catch (error) {
      console.error("Error fetching employees:", error);
      return [];  // In case of an error, return an empty array
  }
};


export const fetchOrdersForTable = async (tableId) => {
  try {
      const response = await fetch(`http://127.0.0.1:8000/cafeApi/orders/?table=${tableId}`);
      if (!response.ok) {
          throw new Error("Failed to fetch orders for table");
      }
      return await response.json();
  } catch (error) {
      console.error("Error fetching orders for table:", error);
      return [];
  }
}

export const deleteTable = async (tableId) => {
  try {
    const response = await axios.delete(`http://127.0.0.1:8000/cafeApi/tables/${tableId}/`);
    return response.status === 204; // Django returns 204 No Content on success
  } catch (error) {
    console.error("Error deleting table:", error);
    return false;
  }
};
