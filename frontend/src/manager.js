import React, { useState, useEffect } from "react";
import { fetchMenuItems, addMenuItem, deleteMenuItem, updateMenuItem, fetchEmployees } from "./api"; 
import { fetchNotificationsForStaff } from "./api";
import axios from "axios";
import { fetchTables, fetchOrdersForTable } from "./api";
import "./manager.css";
import { fetchWaiters, fetchKitchenStaff } from "./api";
import { useMemo } from "react";
import { deleteTable } from "./api";


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
        production_cost: "", 
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

    const [showEditModal, setShowEditModal] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [waiters, setWaiters] = useState([]);
    const [kitchenStaff, setKitchenStaff] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [isWaiter, setIsWaiter] = useState(true); 
    const [updatedEmployee, setUpdatedEmployee] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: ''
    });

    const [productionCosts, setProductionCosts] = useState({});

    const handleCostChange = (itemId, cost) => {
        const cleaned = cost.replace(',', '.');
        setProductionCosts((prev) => ({
            ...prev,
            [itemId]: cleaned
        }));
    };
    
    const [showOrdersPopup, setShowOrdersPopup] = useState(false);
    const [selectedTableOrders, setSelectedTableOrders] = useState([]);
    const [selectedTableNumber, setSelectedTableNumber] = useState(null);

    const [newTableNumber, setNewTableNumber] = useState("");
    const [newTableWaiterId, setNewTableWaiterId] = useState("");
    const [showEditTablePopup, setShowEditTablePopup] = useState(false);
    const [editedTable, setEditedTable] = useState(null);


    const handleDeleteTable = async (tableId) => {
        if (window.confirm("Are you sure you want to delete this table?")) {
          const success = await deleteTable(tableId);
          if (success) {
            setTables((prev) => prev.filter((table) => table.id !== tableId));
            alert("Table deleted successfully.");
          } else {
            alert("Failed to delete table.");
          }
        }
      };      
    
    const handleAddTable = async () => {
        if (!newTableNumber || !newTableWaiterId) {
            alert("Please enter a table number and select a waiter.");
            return;
        }
    
        try {
            const response = await axios.post("http://127.0.0.1:8000/cafeApi/tables/", {
                number: newTableNumber,
                waiter: newTableWaiterId
            });
    
            if (response.status === 201 || response.status === 200) {
                setNewTableNumber("");
                setNewTableWaiterId("");
                const updatedTables = await fetchTables();
                setTables(updatedTables || []);
                alert("Table added successfully!");
            } else {
                alert("Failed to add table.");
            }
        } catch (error) {
            console.error("Error adding table:", error.response?.data || error.message);
            alert("Error creating table.");
        }
    };
    
    const handleEditTable = async (tableId, updatedData) => {
        try {
          const response = await axios.put(
            `http://127.0.0.1:8000/cafeApi/tables/${tableId}/update/`,
            updatedData
          );
          if (response.status === 200) {
            const updatedTables = await fetchTables();
            setTables(updatedTables);
            setShowEditTablePopup(false);
            alert("Table updated successfully.");
          }
        } catch (err) {
          console.error("Error updating table:", err);
          alert("Failed to update table.");
        }
      };
      
      

    const handleEditEmployee = (employee) => {
        console.log("Editing employee:", employee);
    
        setSelectedEmployee(employee);
        setUpdatedEmployee({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone,
            role: employee.role?.toLowerCase() || 'waiter', // use provided role
        });
    
        setShowEditModal(true);
    };
    
    
    const getWaiterRevenue = (waiter) => {
        return tables
            .filter(table => table.waiter === waiter.id) // safer: ID comparison
            .reduce((sum, table) => sum + (table.revenue || 0), 0);
    };
    
    const getWaiterRevenues = () => {
        return waiters.map(waiter => {
            const revenue = tables
                .filter(table => table.waiter === waiter.id)
                .reduce((sum, table) => sum + (table.revenue || 0), 0);
            return { ...waiter, revenue };
        });
    };
    
    
    const topWaiter = useMemo(() => {
        const revenues = getWaiterRevenues();
        if (!revenues || revenues.length === 0) return null;
    
        return revenues.reduce((top, curr) =>
            curr.revenue > (top?.revenue || 0) ? curr : top,
            null
        );
    }, [waiters, tables]);
    
      
    
    const handleChangeRole = (e) => {
        const { value } = e.target;
        setUpdatedEmployee(prevState => ({
            ...prevState,
            role: value,
        }));
    };
    
    const handleSubmitEdit = async (e) => {
        e.preventDefault(); // prevent page reload
    
        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/cafeApi/employee/${selectedEmployee.id}/update/`,
                updatedEmployee
            );
            console.log("Employee updated:", response.data);
    
            setShowEditModal(false);
    
            // ✅ Refresh both waiters and kitchen staff immediately
            const [updatedWaiters, updatedKitchenStaff] = await Promise.all([
                fetchWaiters(),
                fetchKitchenStaff(),
            ]);
    
            setWaiters(updatedWaiters);
            setKitchenStaff(updatedKitchenStaff);
    
            // ✅ Force React to re-render by flipping selectedTab
            setSelectedTab("dummy"); // Switch to a dummy tab
            setTimeout(() => setSelectedTab("employees"), 10); // Switch back to refresh UI
    
        } catch (error) {
            console.error("Error updating employee:", error.response?.data || error.message);
            alert("Failed to update employee.");
        }
    };
    
    
    
    
    useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === "Escape") setShowOrdersPopup(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (showOrdersPopup) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "unset";
        }
    }, [showOrdersPopup]);
            
    
    
    useEffect(() => {
        const loadWaiters = async () => {
          try {
            const response = await axios.get("http://127.0.0.1:8000/cafeApi/waiters/");
            console.log("Fetched Waiters:", response.data);
            setWaiters(response.data);
          } catch (error) {
            console.error("Error fetching waiters:", error);
          }
        };
      
        const loadKitchenStaff = async () => {
          try {
            const response = await axios.get("http://127.0.0.1:8000/cafeApi/kitchen_staff/");
            console.log("Fetched Kitchen Staff:", response.data);
            setKitchenStaff(response.data);
          } catch (error) {
            console.error("Error fetching kitchen staff:", error);
          }
        };
      
        if (selectedTab === "employees" || selectedTab === "tables") {
          loadWaiters();
          loadKitchenStaff();
        }
      }, [selectedTab]);
      

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
        // Fetch employees initially when the component is mounted
        const loadEmployees = async () => {
            const staff = await fetchEmployees();
            setEmployees(staff || []);
        };
    
        loadEmployees();  // Call the function to load employees on component mount
    }, []);

    

    const handleFireEmployee = async (employeeId) => {
        if (window.confirm("Are you sure you want to fire this employee?")) {
            try {
                // Send the DELETE request to fire the employee
                const response = await axios.delete(`http://127.0.0.1:8000/cafeApi/employee/${employeeId}/fire/`);
                
                if (response.status === 200) {
                    // Optimistic UI update: remove the fired employee from the waiters and kitchen staff state
    
                    // Remove the fired employee from the waiters and kitchen staff lists
                    const updatedWaiters = waiters.filter(waiter => waiter.id !== employeeId);
                    const updatedKitchenStaff = kitchenStaff.filter(staff => staff.id !== employeeId);
    
                    // Update the state directly
                    setWaiters(updatedWaiters);
                    setKitchenStaff(updatedKitchenStaff);
    
                    alert("Employee fired successfully.");
                }
            } catch (error) {
                console.error("Error firing employee:", error);
                alert("Failed to fire the employee.");
            }
        }
    };
    
    
    useEffect(() => {
        const loadTables = async () => {
            const tablesData = await fetchTables();
            setTables(tablesData || []);
        };
    
        // Load when employees tab or tables tab is selected
        if (selectedTab === "tables" || selectedTab === "employees") {
            loadTables();
        }
    }, [selectedTab]);
    

    const handleViewOrders = async (tableId, tableNumber) => {
        try {
          const tableOrders = await fetchOrdersForTable(tableId);
      
          setSelectedTableOrders(tableOrders || []);
          setSelectedTableNumber(tableNumber);
          setShowOrdersPopup(true);
        } catch (error) {
          console.error("Error fetching orders for table:", error);
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
        let processedValue = value;
    
        // Replace comma with dot for number fields
        if (["price", "calories", "cooking_time", "availability", "production_cost"].includes(name)) {
            processedValue = processedValue.replace(',', '.');
        }
    
        if (name === "allergies") {
            const parsed = processedValue
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
    
            if (isEdit) {
                setEditItem(prev => ({ ...prev, allergies: parsed }));
            } else {
                setNewItem(prev => ({ ...prev, allergies: parsed }));
            }
            return;
        }
    
        if (isEdit) {
            setEditItem({ ...editItem, [name]: processedValue });
        } else {
            setNewItem({ ...newItem, [name]: processedValue });
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
        // Force price and cost into a dot-decimal string format (2 decimal places if needed)
        const formattedPrice = typeof item.price === "number"
            ? item.price.toFixed(2).replace(",", ".")
            : item.price?.toString().replace(",", ".");
    
        const formattedCost = typeof item.production_cost === "number"
            ? item.production_cost.toFixed(2).replace(",", ".")
            : item.production_cost?.toString().replace(",", ".");
    
        setEditItem({
            ...item,
            price: formattedPrice,
            category: Array.isArray(item.category) ? item.category : JSON.parse(item.category || "[]"),
            allergies: item.allergies.join(", "), 
            image: item.image,
        });
    
        setEditPreviewImage(item.image);
    
        setProductionCosts((prev) => ({
            ...prev,
            [item.id]: formattedCost
        }));
    
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
        let rawAllergies = editItem.allergies;
        let finalAllergies;
        try {
        // Try parsing JSON if it's a stringified array
        if (typeof rawAllergies === "string" && rawAllergies.trim().startsWith("[")) {
            finalAllergies = JSON.parse(rawAllergies);
        } else if (Array.isArray(rawAllergies)) {
            finalAllergies = rawAllergies;
        } else {
            finalAllergies = rawAllergies.split(",").map(a => a.trim()).filter(Boolean);
        }
        } catch (e) {
        console.warn("Failed to parse allergies, defaulting to array split:", e);
        finalAllergies = rawAllergies.split(",").map(a => a.trim()).filter(Boolean);
        }

        // ✅ Correct allergy handling
        const allergies = Array.isArray(finalAllergies) ? finalAllergies : [];
        allergies.forEach(allergy => {
            formData.append("allergies", allergy); // Don't JSON.stringify
        });



        formData.append("calories", editItem.calories);
        formData.append("cooking_time", editItem.cooking_time);
        formData.append("availability", editItem.availability);
        formData.append("category_input", JSON.stringify(editItem.category));
        formData.append("production_cost", productionCosts[editItem.id] || 0);


    
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
    
    const getProfitSummary = () => {
        const validItems = menuItems.filter(item => {
            const cost = parseFloat(productionCosts[item.id]);
            return !isNaN(cost) && parseFloat(item.price) > 0;
        });
    
        if (validItems.length === 0) return null;
    
        let below60 = 0;
        let equal60 = 0;
        let above60 = 0;
    
        validItems.forEach(item => {
            const price = parseFloat(item.price);
            const cost = parseFloat(productionCosts[item.id]);
            const margin = ((price - cost) / price) * 100;
    
            if (margin > 60) above60++;
            else if (margin === 60) equal60++;
            else below60++;
        });
    
        if (below60 > 0) {
            return { color: 'red', message: 'Overall profit margin under 60%' };
        } else if (equal60 > 0 && above60 === 0) {
            return { color: 'yellow', message: 'Profit margin at 60%' };
        } else if (equal60 > 0 && above60 > 0) {
            return { color: 'yellow', message: 'Some items have a profit margin of 60%' };
        } else {
            return { color: 'green', message: 'Overall profit margin above 60%' };
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

                        {/* Waiters Table */}
                        <div className="employee-section">
                            <h4>🍽️ Waiters</h4>
                            <div className="waiter-note">
                                Best performing waiter has a crown 👑 next to their name. (Performance is based on table revenue, which is the total from all tables assigned to the waiter.)
                            </div>
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Table Revenue (£)</th>
                                    <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {waiters.length > 0 ? (
                                        waiters.map((waiter) => (
                                            <tr key={waiter.id}>
                                                <td>
                                                    {waiter.first_name} {waiter.last_name}
                                                    {topWaiter && topWaiter.id === waiter.id && (
                                                        <span style={{ marginLeft: "6px" }} title="Top Performer">👑</span>
                                                    )}
                                                </td>
                                                <td>{waiter.email}</td>
                                                <td>{waiter.phone || 'N/A'}</td>
                                                <td>£{getWaiterRevenue(waiter).toFixed(2)}</td> {/* ✅ Display revenue */}
                                                <td>
                                                <button onClick={() => handleEditEmployee(waiter)}>Edit</button>
                                                <button onClick={() => handleFireEmployee(waiter.id)}>Fire</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No waiters available.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Kitchen Staff Table */}
                        <div className="employee-section">
                            <h4>👨‍🍳 Kitchen Staff</h4>
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kitchenStaff.length > 0 ? (
                                        kitchenStaff.map((staff) => (
                                            <tr key={staff.id}>
                                                <td>{staff.first_name} {staff.last_name}</td>
                                                <td>{staff.email}</td>
                                                <td>{staff.phone || 'N/A'}</td>
                                                <td>
                                                    <button onClick={() => handleEditEmployee(staff)}>Edit</button>
                                                    <button onClick={() => handleFireEmployee(staff.id)}>Fire</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4">No kitchen staff available.</td>
                                        </tr>
                                    )}
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
                        <div className="add-table-form">
                            <h4>Add New Table</h4>

                            <div className="add-table-inner">
                                <div className="table-input-row">
                                    <input
                                        type="number"
                                        placeholder="Table Number"
                                        value={newTableNumber}
                                        onChange={(e) => setNewTableNumber(e.target.value)}
                                    />
                                    <select
                                        value={newTableWaiterId}
                                        onChange={(e) => setNewTableWaiterId(e.target.value)}
                                    >
                                        <option value="">Select Waiter</option>
                                        {waiters.map((waiter) => (
                                            <option key={waiter.id} value={waiter.id}>
                                                {waiter.first_name} {waiter.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button className="centered-add-btn" onClick={handleAddTable}>Add Table</button>
                            </div>
                        </div>


                        <table className="tables-table">
                        <thead>
                            <tr>
                                <th>Table #</th>
                                <th>Status</th>
                                <th>Waiter</th> {/* ✅ Add this */}
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
                                            <td>{table.waiter_name || "—"}</td> {/* ✅ Show assigned waiter */}
                                            <td>£{(table.revenue !== undefined ? table.revenue : 0).toFixed(2)}</td> 
                                            <td>
                                                <button className="view-orders-button" onClick={() => handleViewOrders(table.id, table.number)}>
                                                    {visibleOrders[table.id] ? "Hide Orders" : "View Orders"}
                                                </button>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => {
                                                    setEditedTable({
                                                    id: table.id,
                                                    number: table.number,
                                                    status: table.status,
                                                    waiter: waiters.find(w => w.first_name === table.waiter_name)?.id || ""
                                                    });
                                                    setShowEditTablePopup(true);
                                                    }}
                                                    >
                                                    Edit
                                                </button>

                                                <button className="delete-btn" onClick={() => handleDeleteTable(table.id)} style={{ marginLeft: "8px" }}>
                                                    Delete
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

                        {/* Ensure Orders are rendered when visibleOrders[table.id] is true */}
                        {tables.map((table) => (
                            visibleOrders[table.id] && orders[table.id]?.orders && (
                                <div key={table.id} className="orders-container">
                                    <h4>Orders for Table #{table.number}</h4>
                                    <table className="orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Total Price (£)</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders[table.id]?.orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>{order.id}</td>
                                                    <td>£{parseFloat(order.total_price).toFixed(2)}</td>
                                                    <td>{order.status}</td>
                                                    <td>
                                                        <button onClick={() => handleViewOrderDetails(order)}>
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p>Total Revenue: £{orders[table.id]?.revenue.toFixed(2)}</p>
                                </div>
                            )
                        ))}
                    </div>
                    
                )}



                {selectedTab === "suggestions" && (
                    <div className="suggestions-container">
                        <h3>Profit Suggestions</h3>

                        {/* Summary Box */}
                        {(() => {
                            const summary = getProfitSummary();
                            if (!summary) return null;
                            return (
                                <div style={{
                                    backgroundColor: summary.color,
                                    color: 'white',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    marginBottom: '20px'
                                }}>
                                    {summary.message}
                                </div>
                            );
                        })()}

                        {/* Suggestions Table */}
                        <table className="suggestions-table">
                            <thead>
                                <tr>
                                    <th>Menu Item</th>
                                    <th>Price (£)</th>
                                    <th>Production Cost (£)</th>
                                    <th>Profit on Item (£)</th> {/* ✅ Add this column */}
                                    <th>Profit Margin (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                            {menuItems.map(item => {
                                const price = parseFloat(item.price);
                                const cost = parseFloat(productionCosts[item.id]) || parseFloat(item.production_cost) || 0;
                                const profit = price - cost;
                                const margin = price > 0 ? ((profit / price) * 100) : null;

                                // ✅ Make sure it's a number before checking
                                const isValidMargin = typeof margin === "number" && !isNaN(margin);
                                const rowClass = isValidMargin
                                    ? margin > 60
                                        ? "profit-high"
                                        : "profit-low"
                                    : "";

                                return (
                                    <tr key={item.id} className={rowClass}>
                                        <td>{item.name}</td>
                                        <td>£{price.toFixed(2)}</td>
                                        <td>£{cost.toFixed(2)}</td>
                                        <td>£{profit.toFixed(2)}</td>
                                        <td>{isValidMargin ? `${margin.toFixed(2)}%` : "N/A"}</td>
                                    </tr>
                                );
                            })}



                            </tbody>
                        </table>

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
                            <label>Production Cost
                                <input
                                    type="number"
                                    name="production_cost"
                                    value={newItem.production_cost || ""}
                                    onChange={handleInputChange}
                                />
                            </label>

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
                            <label>Allergies
                                <input type="text" name="allergies" value={editItem.allergies} onChange={(e) => handleInputChange(e, true)} />
                            </label>
                            <label>Cooking Time<input type="number" name="cooking_time" value={editItem.cooking_time} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Availability<input type="number" name="availability" value={editItem.availability} onChange={(e) => handleInputChange(e, true)} /></label>
                            <label>Price<input
                                    type="text"
                                    name="price"
                                    value={editItem.price}
                                    onChange={(e) => handleInputChange(e, true)}/>
                            </label>
                            <label>
                                Production Cost
                                <input
                                    type="text"
                                    name="production_cost"
                                    value={productionCosts[editItem?.id] ?? ""}
                                    onChange={(e) => handleCostChange(editItem.id, e.target.value)}
                                />

                            </label>

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

            {showEditTablePopup && (
            <>
                <div className="overlay" onClick={() => setShowEditTablePopup(false)}></div>
                <div className="edit-popup edit-table-popup">
                    <h3>Edit Table</h3>

                    <div className="edit-table-grid">
                        <label>
                            Table Number:
                            <input
                                type="number"
                                value={editedTable.number}
                                onChange={(e) =>
                                    setEditedTable({ ...editedTable, number: e.target.value })
                                }
                            />
                        </label>

                        <label>
                            Status:
                            <select
                                value={editedTable.status}
                                onChange={(e) =>
                                    setEditedTable({ ...editedTable, status: e.target.value })
                                }
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="paid for">Paid For</option>
                                <option value="unconfirmed">Unconfirmed</option>
                                <option value="canceled">Canceled</option>
                            </select>
                        </label>

                        <label className="full-width">
                            Assigned Waiter:
                            <select
                                value={editedTable.waiter || ""}
                                onChange={(e) =>
                                    setEditedTable({ ...editedTable, waiter: e.target.value })
                                }
                            >
                                <option value="">Select Waiter</option>
                                {waiters.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.first_name} {w.last_name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="popup-buttons">
                        <button
                            onClick={() =>
                                handleEditTable(editedTable.id, {
                                    number: editedTable.number,
                                    status: editedTable.status,
                                    waiter_id: editedTable.waiter,
                                })
                            }
                        >
                            Save
                        </button>
                        <button onClick={() => setShowEditTablePopup(false)}>Cancel</button>
                    </div>
                </div>

            </>
            )}
            
            {showEditModal && (
    <>
                    {/* Overlay to dim the background */}
                    <div className="overlay" onClick={() => setShowEditModal(false)}></div>

                    {/* Edit Employee Modal */}
                    <div className="edit-employee-popup">
                        <h2>Edit Employee</h2>
                        <form onSubmit={handleSubmitEdit}>
                            <div className="edit-grid">
                                {/* First Name */}
                                <label>
                                    First Name
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={updatedEmployee.first_name}
                                        onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, first_name: e.target.value })}
                                    />
                                </label>

                                {/* Last Name */}
                                <label>
                                    Last Name
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={updatedEmployee.last_name}
                                        onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, last_name: e.target.value })}
                                    />
                                </label>

                                {/* Email */}
                                <label>
                                    Email
                                    <input
                                        type="email"
                                        name="email"
                                        value={updatedEmployee.email}
                                        onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, email: e.target.value })}
                                    />
                                </label>

                                {/* Phone */}
                                <label>
                                    Phone
                                    <input
                                        type="text"
                                        name="phone"
                                        value={updatedEmployee.phone}
                                        onChange={(e) => setUpdatedEmployee({ ...updatedEmployee, phone: e.target.value })}
                                    />
                                </label>

                                {/* Role Selector */}
                                <label>
                                    Role
                                    <select
                                        value={updatedEmployee.role}
                                        onChange={handleChangeRole}
                                        className="select-role"
                                    >
                                        <option value="waiter">Waiter</option>
                                        <option value="kitchen staff">Kitchen Staff</option>
                                    </select>

                                </label>

                            </div>

                            {/* Bottom Buttons */}
                            <div className="popup-buttons">
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => setShowEditModal(false)} className="close-popup">Cancel</button>
                            </div>
                        </form>
                    </div>
                </>
            )}

            {showOrdersPopup && (
            <>
                <div className="overlay" onClick={() => setShowOrdersPopup(false)}></div>
                <div className="order-popup">
                <div className="order-popup-content">
                    <h3>Orders for Table #{selectedTableNumber}</h3>

                    {selectedTableOrders.length > 0 ? (
                    <table className="orders-table">
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Total Price (£)</th>
                            <th>Status</th>
                            <th>Items</th>
                        </tr>
                        </thead>
                        <tbody>
                        {selectedTableOrders.map((order) => (
                            <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>£{parseFloat(order.total_price).toFixed(2)}</td>
                            <td>{order.status}</td>
                            <td>
                                <ul>
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                    {item.name} x {item.quantity}
                                    </li>
                                ))}
                                </ul>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    ) : (
                    <p>No orders for this table.</p>
                    )}

                    <button className="close-popup" onClick={() => setShowOrdersPopup(false)}>
                    Close
                    </button>
                </div>
                </div>
            </>
            )}

        </div>
    );
}

export default Manager;
