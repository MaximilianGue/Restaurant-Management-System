import React, { useState, useEffect } from "react";
import { fetchMenuItems, addMenuItem, deleteMenuItem } from "./api"; 
import "./manager.css";

function Manager() {
    const [menuItems, setMenuItems] = useState([]);
    const [newItem, setNewItem] = useState({
        name: "",
        calories: "",
        allergies: "",
        category: "",
        cooking_time: "",
        availability: "",
        price: "",
        image: null,
    });
    const [previewImage, setPreviewImage] = useState("");
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        const loadMenu = async () => {
            const items = await fetchMenuItems();
            setMenuItems(items || []);
        };
        loadMenu();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem({ ...newItem, [name]: value });
    };

    const handleImageChange = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreviewImage(reader.result);
                setNewItem({ ...newItem, image: file });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageChange(file);
    };

    const handleAddItem = async () => {
        if (!newItem.name || !newItem.calories || !newItem.price || !newItem.category || !newItem.image) {
            alert("Please fill out all fields and upload an image.");
            return;
        }

        const formData = new FormData();
        Object.keys(newItem).forEach((key) => {
            formData.append(key, newItem[key]);
        });

        const response = await addMenuItem(formData);
        if (response) {
            setMenuItems([...menuItems, response]);
            setNewItem({ name: "", calories: "", allergies: "", category: "", cooking_time: "", availability: "", price: "", image: null });
            setPreviewImage("");
        } else {
            alert("Failed to add item.");
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            const response = await deleteMenuItem(id);
            if (response) setMenuItems(menuItems.filter(item => item.id !== id));
            else alert("Failed to delete item.");
        }
    };

    return (
        <div className="manager-container">
            <h2>Manager Dashboard</h2>
            <p>Manage the menu by adding or removing items.</p>

            {/* Add New Item Form */}
            <div className="add-item-form">
                <h3>Add a New Menu Item</h3>
                <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Item Name" />
                <input type="number" name="calories" value={newItem.calories} onChange={handleInputChange} placeholder="Calories" />
                <input type="text" name="allergies" value={newItem.allergies} onChange={handleInputChange} placeholder="Allergies (comma-separated)" />
                <input type="text" name="category" value={newItem.category} onChange={handleInputChange} placeholder="Category (e.g. Dessert, Main Course)" />
                <input type="number" name="cooking_time" value={newItem.cooking_time} onChange={handleInputChange} placeholder="Cooking Time (minutes)" />
                <input type="number" name="availability" value={newItem.availability} onChange={handleInputChange} placeholder="Availability (stock count)" />
                <input type="number" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price (£)" />

                {/* Drag and Drop Image Upload */}
                <div
                    className={`drop-zone ${dragging ? "dragging" : ""}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >
                    <p>Drag & Drop an Image or Click to Upload</p>
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} />
                </div>
                
                {previewImage && <img src={previewImage} alt="Preview" className="image-preview" />}
                <button onClick={handleAddItem}>Add Item</button>
            </div>

            {/* Menu List */}
            <div className="menu-list">
                <h3>Current Menu Items</h3>
                {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                        <div key={item.id} className="menu-item">
                            <img src={item.image} alt={item.name} className="menu-image" />
                            <div className="menu-details">
                                <h4>{item.name}</h4>
                                <p><strong>Category:</strong> {item.category}</p>
                                <p><strong>Calories:</strong> {item.calories}</p>
                                <p><strong>Allergies:</strong> {item.allergies || "None"}</p>
                                <p><strong>Cooking Time:</strong> {item.cooking_time} min</p>
                                <p><strong>Availability:</strong> {item.availability}</p>
                                <p><strong>Price:</strong> £{item.price}</p>
                                <button onClick={() => handleDeleteItem(item.id)} className="delete-btn">Remove</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No menu items available.</p>
                )}
            </div>
        </div>
    );
}

export default Manager;
