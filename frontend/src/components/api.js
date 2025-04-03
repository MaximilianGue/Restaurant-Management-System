/**
 * API file for the frontend of the project.
 * Handeling of HTTP requests to the Django backend using Axios.
 */

import axios from "axios"; 

const BASE_URL = "http://127.0.0.1:8000/cafeApi";  

/**
 * Axios instance configured with base URL and JSON headers
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Fetches menu items */
export const fetchMenuItems = async () => {
  try {
    const response = await api.get("/menu-items/");
    return response.data;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
};

/**
 * Fetch a single menu item by ID
 * @param {number} menuItemId - menu item id
 * @returns {Object|null} data of menu item (or null)
 */
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

/** Fetches all customers */
export const fetchCustomers = async () => {
  try {
    const response = await api.get("/customers/");
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

/**
 * Fetches one order of customer by ID
 * @param {number} customerId - ID of the customer
 */
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

/** Fetches all tables */
export const fetchTables = async () => {
  try {
    const response = await api.get("/tables/");
    return response.data;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

/**
 * Fetches one tables order by ID
 * @param {number} tableId -  table Id
 */
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

/** Fetches all orders */
export const fetchOrders = async () => {
  try {
    const response = await api.get("/orders/");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

/**
 * Fetches one order by ID
 * @param {number} orderId - order Id
 */
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

/**
 * Createes a new order
 * @param {Object} orderData - Order data, which is going to be posted
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders/", orderData);
    return response.data;  // This is the correct pattern.
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    return null;  // Just return `null` to indicate failure. Don't try to set errors here.
  }
};

/**
 * Updates order status
 * @param {number} orderId - Id of order
 * @param {string} orderStatus - status of order
 * @param {number} staffId - id of staff
 */
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

/** Deletes an order by ID */
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

/** Fetches all waiters */
export const fetchWaiters = async () => {
  try {
    const response = await api.get("/waiters/");
    return response.data;
  } catch (error) {
    console.error("Error fetching waiters data:", error);
    return [];
  }
};

/**
 * Fetches one waiter by its ID
 * @param {number} waiterId
 */
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

/** Fetches  kitchen staff */
export const fetchKitchenStaff = async () => {
  try {
    const response = await api.get("kitchen_staff/");
    return response.data;
  } catch (error) {
    console.error("Error fetching KitchenStaff:", error);
    return [];
  }
};

/**
 * Fetches a single kitchen staff member
 * @param {number} KitchenStaffId - id of kitchenstaff
 */
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

/**
 * Confirms an order by a staff member
 * @param {number} orderId - id of order
 * @param {string} confirmationStatus - confirmation status of order
 * @param {number} staffId - staff id
 */
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

/**
 * Fetches availability of a menu item
 * @param {number} menuItemId - id of menuitem
 */
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

/**
 * Updates availability field for a menu item
 * @param {number} menuItemId - id of menu item
 * @param {number} availabilityNum - availabitly number
 */
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

/**
 * Calls waiter with one notification
 * @param {number} staffId - id of staff
 * @param {number} orderId - order id
 * @param {string} messages - messages
 * @param {string} type - type
 */
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

/**
 * Notifies staff with a message
 * @param {number} staffId - staff id
 * @param {number} target - target
 * @param {string} messages - messages
 * @param {number} tableNumber - table number
 */
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

/**
 * Fetches details of a waiter
 * @param {number} staffId - staff id
 */
export const fetchWaiterDetails = async (staffId) => {
  try {
    const response = await api.get(`/waiters/${staffId}/`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching waiter details:", error.response ? error.response.data : error.message);
    return null;
  }
};

/**
 * Fetches staff assigned to a table
 * @param {number} tableNumber - number of table
 */
export const fetchStaffIdForTable = async (tableNumber) => {
  try {
    const response = await api.get(`/tables/${tableNumber}/staff_id/`);
    return response.data.staff_id;
  } catch (error) {
    console.error(`Error fetching staff ID for table ${tableNumber}:`, error.response ? error.response.data : error.message);
    return null;
  }
};

/**
 * Fetches notifications for one specific staff member
 * @param {number} staffId
 */
export const fetchNotificationsForStaff = async (staffId) => {
  try {
    const response = await api.get(`/notifications/?staff_id=${staffId}`);
    return response.data;  // Expect list of notifications sorted by `created_at` desc
  } catch (error) {
    console.error("Error fetching notifications for staff:", error.response ? error.response.data : error.message);
    return [];
  }
};

/**
 * Deletes menu item by ID
 * @param {number} id - id of menu item
 */
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

/**
 * Adds new menu item
 * @param {FormData} menuItemData - data of menu item
 */
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

/**
 * Updates an existing menu item
 * @param {number} menuItemId - id of menu item
 * @param {FormData} menuItemData - data of menu item
 */
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

/**
 * Creates a Stripe Checkout Session
 * @param {number} paymentId - payment ID
 */
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
/**
 * Verifiys payment status
 * @param {number} paymentId
 */
export const verifyPayment = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/verify/`);
    return response.status;
  } catch (error) {
    console.error("Error verifying payment:", error);
    return null;
  }
};

/**
 * Cancels payment
 * @param {number} paymentId - id of payment
 */
export const cancelPayment = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}/cancel/`);
    return response.status;
  } catch (error) {
    console.error("Error canceling payment:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Gets sales statistics for one waiter
 * @param {number} staffId - id of staff (waiter)
 */
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

/** Fetches all employees */
export const fetchEmployees = async () => {
  try {
      const response = await axios.get("http://127.0.0.1:8000/cafeApi/employees/");
      return response.data;  // This will return the updated list of employees
  } catch (error) {
      console.error("Error fetching employees:", error);
      return [];  // In case of an error, return an empty array
  }
};

/**
 * Fetches orders for a given table
 * @param {number} tableId - table Id
 */
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

/**
 * Deletes a table by its Id
 * @param {number} tableId - table Id
 */
export const deleteTable = async (tableId) => {
  try {
    const response = await axios.delete(`http://127.0.0.1:8000/cafeApi/tables/${tableId}/`);
    return response.status === 204; // Django returns 204 No Content on success
  } catch (error) {
    console.error("Error deleting table:", error);
    return false;
  }
};

/**
 * Confirms the availability of all items in a specific order by order ID.
 * 
 * @param {number} orderId - The ID of the order to check and update.
 * @returns {Object|null} The response data if successful, or null if there's an error.
 */
export const confirmOrderAvailability = async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/confirm_availability/`);
    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error confirming order availability:", error.response ? error.response.data : error.message);
    return null;
  }
};
/**
 * Updates the status of a table.
 * @param {number} tableNumber - The table number (unique identifier).
 * @param {string} newStatus - The new status (e.g., "alert", "all orders received").
 * @returns {Object|null} The response data if successful, or null if there's an error.
 */
export const updateTableStatus = async (tableNumber, newStatus) => {
  try {
    const response = await api.put(
      `/tables/${tableNumber}/update-status/`,
      { status: newStatus },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Table status update response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating table status:", error.response ? error.response.data : error.message);
    return null;
  }
};
