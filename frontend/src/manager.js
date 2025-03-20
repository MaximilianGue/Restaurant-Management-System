import React, { useState, useEffect } from "react";
import { fetchMenuItems, addMenuItem, deleteMenuItem, updateMenuItem, fetchEmployees } from "./api"; 
import { fetchNotificationsForStaff } from "./api";
import axios from "axios";
import { fetchTables, fetchOrdersForTable } from "./api";


import "./manager.css";

function Manager() {
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: "",
        calories: "",
        allergies: "",
        category: [],
        cooking_time: "",
        availability: "",
        price: "",
        image: null,
    });

    const [previewImage, setPreviewImage] = useState("");
    const [editItem, setEditItem] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showAddPopup, setShowAddPopup] = useState(false);
    const [editPreviewImage, setEditPreviewImage] = useState("");
    const [selectedTab, setSelectedTab] = useState("Menu");
    const [employees, setEmployees] = useState([]); 
    const [notifications, setNotifications] = useState([]);
    const STAFF_ID = localStorage.getItem("STAFF_ID"); // Ensure this matches your storage key
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [visibleOrders, setVisibleOrders] = useState({});



    const availableCategories = [
        "Main Course", "Non-Vegetarian", "Appetizer", "Vegetarian",
        "Gluten-Free", "Breakfast", "Dessert", "Drinks"
    ];

    const getStockColor = (availability) => {
        if (availability < 10) return "red"; 
        if (availability < 50) return "orange";
        return "green"; 
    };
    
    useEffect(() => {
        const loadMenu = async () => {
            const items = await fetchMenuItems();
            setMenuItems(items || []);
        };
        if (selectedTab === "Menu" || selectedTab === "Stock") { 
            loadMenu();
        }
    }, [selectedTab]);
    
    useEffect(() => {
        const loadEmployees = async () => {
            const staff = await fetchEmployees();
            console.log("📢 Employees State Before Setting:", staff); 
            setEmployees(staff || []);
        };
        if (selectedTab === "employees") {
            loadEmployees();
        }
    }, [selectedTab]);

    useEffect(() => {
        const loadTables = async () => {
            const tablesData = await fetchTables();
            setTables(tablesData || []);
        };
        if (selectedTab === "tables") {
            loadTables();
        }
    }, [selectedTab]);

    const handleViewOrders = async (tableId) => {
        try {
            const tableOrders = await fetchOrdersForTable(tableId);
            console.log("Fetched Orders for Table", tableId, tableOrders);
            const paidOrders = tableOrders.filter(order => order.status === "paid for");
            console.log("Paid Orders for Table", tableId, paidOrders);
            const totalRevenue = paidOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
            console.log("Total Revenue for Table", tableId, totalRevenue);
    
            setOrders((prevOrders) => ({
                ...prevOrders,
                [tableId]: {
                    orders: tableOrders,
                    revenue: totalRevenue,
                },
            }));
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    
    

    const handleViewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderPopup(true);
    };
    

    useEffect(() => {
        const loadNotifications = async () => {
            const notificationsData = await fetchNotificationsForStaff(STAFF_ID); // Assuming STAFF_ID is defined
            setNotifications(notificationsData || []);
        };
    
        if (selectedTab === "notifications") {
            loadNotifications();
        }
    }, [selectedTab]);
    
    const handleMarkNotificationRead = async (notificationId) => {
        try {
            await axios.post(`http://127.0.0.1:8000/cafeApi/notifications/${notificationId}/mark_as_read/`);
            setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };
    
    const handleInputChange = (e, isEdit = false) => {
        const { name, value } = e.target;
        if (isEdit) {
            setEditItem({ ...editItem, [name]: value });
        } else {
            setNewItem({ ...newItem, [name]: value });
        }
    };

    const handleCategoryChange = (category, isEdit = false) => {
        if (isEdit) {
            setEditItem((prevState) => ({
                ...prevState,
                category: prevState.category.includes(category)
                    ? prevState.category.filter((c) => c !== category)
                    : [...prevState.category, category],
            }));
        } else {
            setNewItem((prevState) => ({
                ...prevState,
                category: prevState.category.includes(category)
                    ? prevState.category.filter((c) => c !== category)
                    : [...prevState.category, category],
            }));
        }
    };

    const handleImageChange = (file, isEdit = false) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (isEdit) {
                    setEditPreviewImage(reader.result);
                    setEditItem((prev) => ({ ...prev, image: file }));
                } else {
                    setPreviewImage(reader.result);
                    setNewItem((prev) => ({ ...prev, image: file }));
                }
            };
            reader.readAsDataURL(file);
        } else {
            if (isEdit) {
                setEditItem((prev) => ({ ...prev, image: prev.image })); 
            }
        }
    };
    
    const handleAddItem = async () => {
        if (!newItem.name || !newItem.calories || !newItem.price || newItem.category.length === 0 || !newItem.image) {
            alert("Please fill out all fields and upload an image.");
            return;
        }

        const formData = new FormData();
        Object.keys(newItem).forEach(key => formData.append(key, newItem[key]));
        formData.append("category", JSON.stringify(newItem.category));

        const response = await addMenuItem(formData);
        if (response) {
            setMenuItems([...menuItems, response]);
            setNewItem({ name: "", calories: "", allergies: "", category: [], cooking_time: "", availability: "", price: "", image: null });
            setPreviewImage("");
            setShowAddPopup(false);
        } else {
            alert("Failed to add item.");
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm("Are you sure?")) {
            const response = await deleteMenuItem(id);
            if (response) {
                setMenuItems(menuItems.filter(item => item.id !== id));
            }
        }
    };

    const handleEditItem = (item) => {
        setEditItem({
            ...item,
            category: Array.isArray(item.category) ? item.category : JSON.parse(item.category || "[]"),
            allergies: item.allergies.length === 0 ? "none" : item.allergies, 
            image: item.image, 
        });
    
        setEditPreviewImage(item.image); 
        setShowEditPopup(true);
    };
    
    const handleUpdateItem = async () => {
        if (!editItem.name || !editItem.calories || !editItem.price || editItem.category.length === 0) {
            alert("Please fill out all required fields.");
            return;
        }
    
        const formData = new FormData();
    
        formData.append("name", editItem.name);
        formData.append("price", editItem.price);
        formData.append("allergies", editItem.allergies === "None" ? [] : editItem.allergies); 
        formData.append("calories", editItem.calories);
        formData.append("cooking_time", editItem.cooking_time);
        formData.append("availability", editItem.availability);
        formData.append("category_input", JSON.stringify(editItem.category));
    
        if (editItem.image instanceof File) {
            formData.append("image", editItem.image);
        }
    
        console.log("Sending PATCH FormData:");
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }
    
        try {
            const response = await updateMenuItem(editItem.id, formData);
            console.log("Update response:", response);
    
            if (response) {
                setMenuItems(menuItems.map((item) => (item.id === editItem.id ? response : item)));
                setShowEditPopup(false);
            } else {
                alert(" Failed to update item.");
            }
        } catch (error) {
            console.error(" Update failed:", error.response?.data || error.message);
            alert(` Failed to update item: ${error.response?.data?.error || error.message}`);
        }
    };
    
    return (
        <div className="manager-container">
            <h2>Manager Dashboard</h2>

            {/* Navigation Bar */}
            <div className="nav-bar">
                {["Menu", "stock", "employees", "notifications", "tables", "suggestions"].map((tab) => (
                    <button
                        key={tab}
                        className={`nav-button ${selectedTab === tab ? "active" : ""}`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            
            <div className="tab-content">
                {selectedTab === "Menu" && (
                    <>
                        <button className="add-btn" onClick={() => setShowAddPopup(true)}>Add Item</button>

                        
                        <div className="menu-container">
                            <h3 className="menu-title">Current Menu Items</h3>
                            <div className="menu-list">
                                {menuItems.map((item) => (
                                    <div key={item.id} className="menu-item">
                                        <img src={item.image} alt={item.name} className="menu-image" />
                                        <h4>{item.name}</h4>
                                        <button className="edit-btn" onClick={() => handleEditItem(item)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {selectedTab === "stock" && (
                    <div className="stock-container">
                        <h3>Stock Management</h3>
                        <table className="stock-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Stock Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuItems.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td style={{ color: getStockColor(item.availability), fontWeight: "bold" }}>
                                            {item.availability}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedTab === "employees" && (
                    <div className="employees-container">
                        <h3>Employee Management</h3>

                       
                        <div className="employee-section">
                            <h4>🍽️ Waiters</h4>
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees
                                        .filter(emp => emp.role?.toLowerCase().includes("waiter")) 
                                        .map((waiter) => (
                                        <tr key={waiter.id}>
                                            <td>{waiter.first_name} {waiter.last_name}</td>
                                            <td>{waiter.email}</td>
                                            <td>{waiter.phone || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        
                        <div className="employee-section">
                            <h4>👨‍🍳 Kitchen Staff</h4>
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees
                                        .filter(emp => emp.role?.toLowerCase().includes("kitchen"))
                                        .map((kitchen) => (
                                        <tr key={kitchen.id}>
                                            <td>{kitchen.first_name} {kitchen.last_name}</td>
                                            <td>{kitchen.email}</td>
                                            <td>{kitchen.phone || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === "notifications" && (
                    <div className="notifications-container">
                        <h3>Latest Notifications</h3>
                        <table className="notifications-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Table</th>
                                    <th>Message</th>
                                    <th>Time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <tr key={notification.id}>
                                            <td>{notification.notification_type}</td>
                                            <td>{notification.table ? notification.table.number : "N/A"}</td>
                                            <td>{notification.message}</td>
                                            <td>{new Date(notification.created_at).toLocaleString()}</td>
                                            <td>
                                                <button onClick={() => handleMarkNotificationRead(notification.id)}>
                                                    Mark as Read
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No notifications.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {selectedTab === "tables" && (
                    <div className="tables-container">
                        <h3>Tables and Orders</h3>
                        <table className="tables-table">
                            <thead>
                                <tr>
                                <th>Table #</th>
                                <th>Status</th>
                                <th>Revenue (£)</th>
                                <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tables.length > 0 ? (
                                    tables.map((table) => (
                                        <tr key={table.id}>
                                            <td>{table.number}</td>
                                            <td>{table.status}</td>
                                            <td>£{(table.revenue !== undefined ? table.revenue : 0).toFixed(2)}</td>  {/* Ensure revenue is correctly displayed */}
                                            <td>
                                                <button 
                                                    className="view-orders-button"
                                                    onClick={() => handleViewOrders(table.id)}
                                                >
                                                    {visibleOrders[table.id] ? "Hide Orders" : "View Orders"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4">No tables available.</td>
                                    </tr>
                                )}
                            </tbody>

                        </table>

                    </div>
                )}

                {selectedTab === "suggestions" && (
                    <div className="tab-placeholder">
                        <h3>Suggestions</h3>
                        <p>View customer feedback and suggestions.</p>
                    </div>
                )}
            </div>

            {showOrderPopup && selectedOrder && (
                <div className="order-popup">
                    <div className="order-popup-content">
                        <h3>Order Details</h3>
                        <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                        <p><strong>Total Price:</strong> £{selectedOrder.total_price}</p>
                        <p><strong>Status:</strong> {selectedOrder.status}</p>

                        <h4>Items</h4>
                        <ul>
                            {selectedOrder.items.map((item, index) => (
                                <li key={index}>
                                    {item.name} - £{item.price} x {item.quantity}
                                </li>
                            ))}
                        </ul>

                        <button className="close-popup" onClick={() => setShowOrderPopup(false)}>Close</button>
                    </div>
                </div>
            )}

            {showAddPopup && (
                <>
                    <div className="overlay" onClick={() => setShowAddPopup(false)}></div>
                    <div className="edit-popup">
                        <h3>Add Menu Item</h3>
                        <div className="edit-grid">
                            <label>Name<input type="text" name="name" value={newItem.name} onChange={handleInputChange} /></label>
                            <label>Calories<input type="number" name="calories" value={newItem.calories} onChange={handleInputChange} /></label>
                            <label>Allergies<input type="text" name="allergies" value={newItem.allergies} onChange={handleInputChange} /></label>
                            <label>Cooking Time<input type="number" name="cooking_time" value={newItem.cooking_time} onChange={handleInputChange} /></label>
                            <label>Availability<input type="number" name="availability" value={newItem.availability} onChange={handleInputChange} /></label>
                            <label>Price<input type="number" name="price" value={newItem.price} onChange={handleInputChange} /></label>
                        </div>
                        <h4>Category</h4>
                        <div className="category-grid">
                            {availableCategories.map((category) => (
                                <button key={category} className={`category-button ${newItem.category.includes(category) ? "selected" : ""}`} onClick={() => handleCategoryChange(category)}>
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="drop-zone">
                            <p>Drag & Drop an Image or Click to Upload</p>
                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} />
                        </div>
                        
                        {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}

                      
                        <div className="popup-buttons">
                            <button onClick={handleAddItem}>Add Item</button>
                            <button onClick={() => setShowAddPopup(false)}>Cancel</button>
                        </div>

                    </div>
                </>
            )}
       
            {showEditPopup && (
                <>
                    <div className="overlay" onClick={() => setShowEditPopup(false)}></div>
                    <div className="edit-popup">
                        <h3>Edit Menu Item</h3>
                        <div className="edit-grid">
                            <label>Name<input type="text" name="name" value={editItem.name} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Calories<input type="number" name="calories" value={editItem.calories} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Allergies<input type="text" name="allergies" value={editItem.allergies} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Cooking Time<input type="number" name="cooking_time" value={editItem.cooking_time} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Availability<input type="number" name="availability" value={editItem.availability} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Price<input type="number" name="price" value={editItem.price} onChange={(e) => handleInputChange(e, true)} /></label>
                        </div>
                        <h4>Category</h4>
                        <div className="category-grid">
                            {availableCategories.map((category) => (
                                <button key={category} className={`category-button ${editItem.category.includes(category) ? "selected" : ""}`} onClick={() => handleCategoryChange(category, true)}>
                                    {category}
                                </button>
                            ))}
                        </div>
                        <div className="drop-zone">
                            <p>Update Item Image</p>
                            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0], true)} />
                        </div>
                        
                        {editPreviewImage && <img src={editPreviewImage} alt="Preview" className="image-preview" />}

                        
                        <div className="popup-buttons">
                            <button onClick={handleUpdateItem}>Update Item</button>
                            <button onClick={() => setShowEditPopup(false)}>Cancel</button>
                        </div>


                    </div>
                </>
            )}
        

        </div>
    );
}

export default Manager;
