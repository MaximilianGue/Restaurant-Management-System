import React, { useState, useEffect } from "react";
import { fetchMenuItems, addMenuItem, deleteMenuItem, updateMenuItem } from "./api"; 
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
    const [selectedTab, setSelectedTab] = useState("Menu"); // Track selected tab

    const availableCategories = [
        "Main Course", "Non-Vegetarian", "Appetizer", "Vegetarian",
        "Gluten-Free", "Breakfast", "Dessert", "Drinks"
    ];



    useEffect(() => {
        const loadMenu = async () => {
            const items = await fetchMenuItems();
            setMenuItems(items || []);
        };
        if (selectedTab === "Menu") {
            loadMenu();
        }
    }, [selectedTab]);


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
                    setEditItem({ ...editItem, image: file });
                } else {
                    setPreviewImage(reader.result);
                    setNewItem({ ...newItem, image: file });
                }
            };
            reader.readAsDataURL(file);
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
        setEditItem(item);
        setEditPreviewImage(item.image);
        setShowEditPopup(true);
    };

    const handleUpdateItem = async () => {
        if (!editItem.name || !editItem.calories || !editItem.price || editItem.category.length === 0) {
            alert("Please fill out all fields.");
            return;
        }

        const formData = new FormData();
        Object.keys(editItem).forEach(key => formData.append(key, editItem[key]));
        formData.append("category", JSON.stringify(editItem.category));

        if (editItem.image instanceof File) {
            formData.append("image", editItem.image);
        }

        const response = await updateMenuItem(editItem.id, formData);
        if (response) {
            setMenuItems(menuItems.map(item => item.id === editItem.id ? response : item));
            setShowEditPopup(false);
        } else {
            alert("Failed to update item.");
        }
    };

    return (
        <div className="manager-container">
            <h2>Manager Dashboard</h2>

            {/* Navigation Bar */}
            <div className="nav-bar">
                {["Menu", "Human Resource", "Notifications", "Suggestions"].map((tab) => (
                    <button
                        key={tab}
                        className={`nav-button ${selectedTab === tab ? "active" : ""}`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Conditional Rendering Based on Selected Tab */}
            <div className="tab-content">
                {selectedTab === "Menu" && (
                    <>
                        <button className="add-btn" onClick={() => setShowAddPopup(true)}>Add Item</button>

                        {/* Menu List */}
                        <div className="menu-container">
                            <h3 className="menu-title">Current Menu Items</h3> {/* Moves title outside grid */}
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

                {selectedTab === "Human Resource" && (
                    <div className="tab-placeholder">
                        <h3>Human Resource Management</h3>
                        <p>Manage employee records, work shifts, and HR tasks.</p>
                    </div>
                )}

                {selectedTab === "Notifications" && (
                    <div className="tab-placeholder">
                        <h3>Notifications</h3>
                        <p>View and manage system notifications.</p>
                    </div>
                )}

                {selectedTab === "Suggestions" && (
                    <div className="tab-placeholder">
                        <h3>Suggestions</h3>
                        <p>View customer feedback and suggestions.</p>
                    </div>
                )}
            </div>






            {/* Add Item Pop-Up */}
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
                        {/* Image Preview */}
                        {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}

                        {/* Buttons */}
                        <div className="popup-buttons">
                            <button onClick={handleAddItem}>Add Item</button>
                            <button onClick={() => setShowAddPopup(false)}>Cancel</button>
                        </div>

                    </div>
                </>
            )}

            {/* Edit Item Pop-Up */}
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
                        {/* Image Preview */}
                        {editPreviewImage && <img src={editPreviewImage} alt="Preview" className="image-preview" />}

                        {/* Buttons */}
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
