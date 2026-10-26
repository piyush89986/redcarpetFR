import React, { useEffect, useState } from "react";
import axios from "axios";

const ShopList = () => {
    const [shops, setShops] = useState([]);
    const [editShop, setEditShop] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "", price: "" });

    useEffect(() => {
        fetchShopItems();
    }, []);

    const fetchShopItems = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/shops`); // Replace with your API
            setShops(response.data);
        } catch (error) {
            console.error("Error fetching shop items:", error);
        }
    };

    const handleEditClick = (shop) => {
        setEditShop(shop._id);
        setFormData({ name: shop.name, description: shop.description, price: shop.price });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/shops/update/${editShop}`, formData);
            fetchShopItems();
            setEditShop(null);
        } catch (error) {
            console.error("Error updating shop item:", error);
        }
    };

    return (
        <div>
            <h2>Shop Items</h2>
            {shops.map((shop) => (
                <div key={shop._id} className="shop-item">
                    {editShop === shop._id ? (
                        <div>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                            <input type="text" name="description" value={formData.description} onChange={handleInputChange} />
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange} />
                            <button onClick={handleSave}>Save</button>
                        </div>
                    ) : (
                        <div>
                            <h3>{shop.name}</h3>
                            <p>{shop.description}</p>
                            <p>Price: ₹{shop.price}</p>
                            <button onClick={() => handleEditClick(shop)}>Edit</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ShopList;
