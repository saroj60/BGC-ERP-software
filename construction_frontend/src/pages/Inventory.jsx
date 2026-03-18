import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // For edit
    const [formData, setFormData] = useState({ name: '', quantity: '', unit: '' });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await api.get('materials/inventory/');
            setItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching inventory", error);
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                // Update
                await api.patch(`materials/inventory/${currentItem.id}/`, formData);
            } else {
                // Create
                await api.post('materials/inventory/', formData);
            }
            setShowModal(false);
            setFormData({ name: '', quantity: '', unit: '' });
            setCurrentItem(null);
            fetchInventory();
        } catch (error) {
            alert("Failed to save item: " + (error.response?.data?.detail || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await api.delete(`materials/inventory/${id}/`);
            fetchInventory();
        } catch (error) {
            alert("Failed to delete item");
        }
    };

    const openAddModal = () => {
        setCurrentItem(null);
        setFormData({ name: '', quantity: '', unit: '' });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setFormData({ name: item.name, quantity: item.quantity, unit: item.unit });
        setShowModal(true);
    };

    const styles = {
        container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
        title: { fontSize: '24px', color: '#2c3e50', margin: 0 },
        addButton: { padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' },
        table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
        th: { background: '#f8f9fa', padding: '15px', textAlign: 'left', borderBottom: '2px solid #e9ecef', color: '#495057', fontWeight: '600' },
        td: { padding: '15px', borderBottom: '1px solid #e9ecef', color: '#333' },
        actionBtn: { marginRight: '10px', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
        modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px', maxWidth: '90%' },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' },
        input: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
        modalActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '20px' },
        cancelBtn: { padding: '8px 16px', marginRight: '10px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
        saveBtn: { padding: '8px 16px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Inventory Management</h2>
                <button style={styles.addButton} onClick={openAddModal}>+ Add Item</button>
            </div>

            {loading ? <p>Loading...</p> : (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Quantity</th>
                            <th style={styles.th}>Unit</th>
                            <th style={styles.th}>Last Updated</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>No items in inventory</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id}>
                                <td style={styles.td}>{item.name}</td>
                                <td style={styles.td}>{item.quantity}</td>
                                <td style={styles.td}>{item.unit}</td>
                                <td style={styles.td}>{new Date(item.last_updated).toLocaleDateString()}</td>
                                <td style={styles.td}>
                                    <button onClick={() => openEditModal(item)} style={{ ...styles.actionBtn, backgroundColor: '#f1c40f', color: 'white' }}>Edit</button>
                                    <button onClick={() => handleDelete(item.id)} style={{ ...styles.actionBtn, backgroundColor: '#e74c3c', color: 'white' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{ marginTop: 0 }}>{currentItem ? 'Edit Item' : 'Add Item'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Quantity</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="e.g., kg, liters"
                                    required
                                />
                            </div>
                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                                <button type="submit" style={styles.saveBtn}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
