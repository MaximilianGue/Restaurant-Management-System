import React, { useState, useEffect } from "react";
import { 
  fetchMenuItems, 
  fetchOrders, 
  createOrder,
  fetchStaffIdForTable,
  callWaiter,
  createCheckoutSession,
  verifyPayment,
  cancelPayment 
} from "./api";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./home.css";

/**
 * This is the home component, where customers can:
 * - Browse the menu items
 * - Filter and select items, which they want to order
 * - Place orders
 * - Call waiters
 * - Pay using stripe
 */
function Home() {
  const [role, setRole] = useState(0);
  const [cart, setCart] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const [hiddenItems, setHiddenItems] = useState([]);

  // Loads menu items and orders
  useEffect(() => {
    setRole(0); 
    const loadData = async () => {
      const items = await fetchMenuItems();
      setMenuItems(items || []);
      const ordersData = await fetchOrders();
      setOrders(ordersData || []);
    };
    loadData();
  }, []);

  // Loads the hidden items from the localStorage
  useEffect(() => {
    const storedHiddenItems = JSON.parse(localStorage.getItem("hiddenItems")) || [];
    setHiddenItems(storedHiddenItems);
  }, []);
  
  // Applies different CSS classes to body
  useEffect(() => {
    document.body.classList.remove("waiter", "kitchen", "customer");
    if (role === 0) document.body.classList.add("customer");
    if (role === 1) document.body.classList.add("waiter");
    if (role === 2) document.body.classList.add("kitchen");
  }, [role]);

  // Fetches table numbers from the backend
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/cafeApi/tables/");
        const tableData = await response.json();
        setTables(tableData || []);
      } catch (error) {
        console.error("Error fetching tables:", error);
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, []);

   /** Adds item to cart with quantity 1 */
  const handleSelect = (itemName) => {
    setCart((prevCart) => ({ ...prevCart, [itemName]: 1 }));
  };

  /** Changes the quantity of an item */
  const handleQuantityChange = (itemName, type) => {
    setCart((prevCart) => {
      const currentQuantity = prevCart[itemName] || 1;
      let newQuantity = type === "increase" ? currentQuantity + 1 : currentQuantity - 1;
      if (newQuantity < 1) {
        const updatedCart = { ...prevCart };
        delete updatedCart[itemName];
        return updatedCart;
      }
      return { ...prevCart, [itemName]: newQuantity };
    });
  };

  /** Calculates total order cost */
  const totalAmount = Object.keys(cart)
    .reduce((sum, itemName) => {
      const item = menuItems.find((menuItem) => menuItem.name === itemName);
      return sum + (parseFloat(item?.price || 0) * cart[itemName]);
    }, 0)
    .toFixed(2);

  /** Calculates total cooking time */
  const totalTime = Object.keys(cart)
    .reduce((sum, itemName) => {
      const item =  menuItems.find((menuItem) => menuItem.name === itemName);
      return sum + (parseFloat(item?.cooking_time || 0) * cart[itemName]);
    }, 0);

  /** Handles input changes for specific table number */
  const handleTableNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setTableNumber(value ? parseInt(value, 10) : "");
    if (value.length <= 3) {
      setTableNumber(value);
    }
  };

  /** Submits order */
  const handlePlaceOrder = async () => {
    const tableNum = parseInt(tableNumber, 10);
    console.log(tableNumber)
    console.log(tableNum)
    const staffId = await fetchStaffIdForTable(tableNum);
    if (isNaN(tableNum)) {
      setErrorMessage("Please enter a valid table number.");
      setShowPopup(true);
      return;
    }
    if (!tables.some((table) => table.number === tableNum)) {
      setErrorMessage("Invalid table number. This table number does not exist.");
      setShowPopup(true);
      return;
    }
    const orderData = {
      table_number: tableNumber,
      status: "pending",
      total_price: parseFloat(totalAmount),
      Staff_id: staffId,
      items: Object.keys(cart).map((itemName) => {
        const item = menuItems.find((menuItem) => menuItem.name === itemName);
        return {
          item_id: item?.id,
          quantity: cart[itemName],
        };
      }),
    };

    try {
      const response = await createOrder(orderData);
      if (response) {
        setCart({});
        setOrders([...orders, response]);
        setErrorMessage("Order placed successfully!");
        setShowPopup(true);
      } else {
        setErrorMessage("Failed to place order. Please try again.");
        setShowPopup(true);
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setErrorMessage(`Error placing order: ${error.message || "Unknown error"}`);
      setShowPopup(true);
    }
  };

  /** Calls assigned waiter to the currently selected table */
  const handleCallWaiter = async () => {
    const tableNum = parseInt(tableNumber, 10);
    if (isNaN(tableNum)) {
      setErrorMessage("Please enter a valid table number.");
      setShowPopup(true);
      return;
    }
    if (!tables.some((table) => table.number === tableNum)) {
      setErrorMessage("Invalid table number. This table number does not exist.");
      setShowPopup(true);
      return;
    }
    const staffId = await fetchStaffIdForTable(tableNum);
    if (!staffId) {
      setErrorMessage("No waiter is assigned to this table.");
      setShowPopup(true);
      return;
    }
    const tableOrders = orders.filter((order) => order.table_id === tableNum);
    if (tableOrders.length === 0) {
      setErrorMessage("No orders found for this table. Cannot call waiter.");
      setShowPopup(true);
      return;
    }
    const latestOrder = tableOrders[tableOrders.length - 1];
    const response = await callWaiter(staffId, latestOrder.id, "", "waiter_call");
    if (response) {
      const table = tables.find((table) => table.number == tableNum);
      table.status = "Alert!";
      setErrorMessage("Waiter has been called to your table!");
      setShowPopup(true);
    } else {
      setErrorMessage("Failed to call waiter. Please try again.");
    }
    setShowPopup(true);
  };

  /** Initiates Stripe Checkout */
  const handlePayNow = async (orderId) => {
    // orderId is the same as paymentId because of one-to-one relationship
    const checkoutUrl = await createCheckoutSession(orderId);

    console.log(checkoutUrl)
    if (checkoutUrl) {
      // Redirects user to Stripe Checkout
      window.location.href = checkoutUrl;
    } else {
      setErrorMessage("Error initiating payment. This order is already paid for.");
      setShowPopup(true);
    }
  };

  /** Verifies payment status */
  const handleVerifyPayment = async (orderId) => {
    try {
      const response = await verifyPayment(orderId);
      if (response === 200) {
        setErrorMessage("Payment verified successfully!");
      } else {
        setErrorMessage("Payment not completed yet.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error.response ? error.response.status : error);
    }
    setShowPopup(true);
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  /** Cancels an active payment */
  const handleCancelPayment = async (orderId) => {
    const response = await cancelPayment(orderId);
    if (response === 200) {
      setErrorMessage("Payment has been canceled.");
    } else {
      setErrorMessage("Error canceling payment.");
    }
    setShowPopup(true);
    // Optionally, refresh orders
    const ordersData = await fetchOrders();
    setOrders(ordersData || []);
  };

  /** Filters menu items based on selected category */
  const handleFilterChange = (category) => {
    setFilter(category);
  };

  /** All the filtered menu items excluding hidden ones */
  const filteredMenuItems =
    filter === "All"
      ? menuItems.filter((item) => !hiddenItems.includes(item.name))
      : menuItems.filter((item) => {
          if (Array.isArray(item.category)) {
            return item.category.includes(filter);
          }
          return item.category.toLowerCase() === filter.toLowerCase();
        }).filter((item) => !hiddenItems.includes(item.name));


  /**
   * Renders home page, including:
   * - A title and the filterable menu grid
   * - Dynamic cart
   * - Order summary and the payment options
   * - Popups for error and the confirmation feedback
   */        
  return (
    <div className="container">
      {/* Restaurant Title */}
      <h1 className="restaurant-title">Oaxaca</h1>

      {/* Category Filter Buttons */}
      <div className="filter-container">
        {[
          "All",
          "Main Course",
          "Non-Vegetarian",
          "Appetizer",
          "Vegetarian",
          "Gluten-Free",
          "Breakfast",
          "Dessert",
          "Drinks",
        ].map((category) => (
          <button
            key={category}
            onClick={() => handleFilterChange(category)}
            className={`filter-button ${filter === category ? "active" : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Layout splits Between the menu on the left side and the order summary on the right */}
      <div className="main-container">
        {/* Menu Grid */}
        <div className="menu-container">
          <div className="menu-grid">
            {filteredMenuItems.length > 0 ? (
              filteredMenuItems.map((item, index) => (
                <div className="menu-item" key={index}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="menu-item-image"
                    onError={(e) =>
                      (e.target.src = "/fallback-image.jpg")
                    }
                  />
                  <div className="menu-item-details">
                    <h4>{item.name}</h4>
                    <p className="price">£{item.price}</p>
                    <p>
                      <strong>Allergies:</strong>{" "}
                      {Array.isArray(item.allergies)
                        ? item.allergies.join(", ")
                        : item.allergies}
                    </p>
                    <p>
                      <strong>Calories</strong> {item.calories}
                    </p>
                    {cart[item.name] ? (
                      <div className="counter">
                        <button
                          onClick={() =>
                            handleQuantityChange(item.name, "decrease")
                          }
                          className="counter-btn"
                        >
                          -
                        </button>
                        <span>{cart[item.name]}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item.name, "increase")
                          }
                          className="counter-btn"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelect(item.name)}
                        className="select-button"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Loading menu.../No items available in this category...</p>
            )}
          </div>
        </div>
        {/* The order summary and the table input */}
        <div className="order-summary">
          <label>Enter Table Number:</label>
          <input
            type="text"
            value={tableNumber}
            onChange={handleTableNumberChange}
            placeholder="e.g. 001"
            className="table-input"
            maxLength="3"
          />
          <button onClick={handleCallWaiter} className="call-waiter-btn">
            Call Waiter
          </button>
          {/* Order Summary */}
          <h4>Order Summary</h4>
          {Object.keys(cart).length > 0 ? (
            <>
              {Object.keys(cart).map((itemName) => {
                const item = menuItems.find(
                  (menuItem) => menuItem.name === itemName
                );
                return (
                  <div key={itemName} className="order-summary-item">
                    <span>
                      {itemName} x{cart[itemName]}
                    </span>
                    <span>
                      £
                      {(parseFloat(item.price) * cart[itemName]).toFixed(2)}
                    </span>
                    <span> 
                      Est: {(parseFloat(item.cooking_time))} Minutes
                    </span>
                  </div>
                );
              })}
              <div className="order-summary-total">
                <span>Total</span>
                <span>£{totalAmount}</span>
                <span>Est: {totalTime} Minutes</span>
              </div>
              <button onClick={handlePlaceOrder} className="order-button">
                Place Order
              </button>
            </>
          ) : (
            <p>Your cart is empty</p>
          )}
          {/* The placed Orders */}
          <h4>Placed Orders</h4>
          <p>Scroll to see all your orders</p>
          <div className="placed-orders-container">
            {orders.length === 0 ? (
              <p>No orders placed for this table.</p>
            ) : (
              orders
                .filter(
                  (order) =>
                    order.table_number === parseInt(tableNumber, 10)
                )
                .map((order) => (
                  <div key={order.id} className="placed-order">
                    <p>Order #{order.id}</p>
                    <p>Status: {order.status}</p>
                    <p>Total: £{order.total_price}</p>
                    {/* Payment Buttons for orders that are not paid */}
                    {order.status !== "paid for" && (
                      <div className="payment-actions">
                        <button
                          onClick={() => handlePayNow(order.id)}
                          className="order-button"
                        >
                          Pay Now
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(order.id)}
                          className="order-button"
                        >
                          Verify Payment
                        </button>
                        <button
                          onClick={() => handleCancelPayment(order.id)}
                          className="order-button"
                        >
                          Cancel Payment
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
      {/* Global Popups for messages */}
      {showPopup && (
        <div className="custom-popup">
          <p>{errorMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default Home;
