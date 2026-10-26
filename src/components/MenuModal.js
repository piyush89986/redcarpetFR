import React, { useState } from "react";
import axios from "axios";

const MenuModal = ({ shop, onClose }) => {
  const [menuItem, setMenuItem] = useState({ 
    name: "", 
    image: "", 
    description: "" ,
    link: "a",  //  New field added for storing the link
    email: "",
    password: "",
    shopconpassword: "",
    role: ""
  });

  const handleChange = (e) => {
    setMenuItem({ ...menuItem, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shop?._id) {
      alert("Shop ID is missing!");
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/shops/${shop._id}/menu`, menuItem);
      alert("Menu item added successfully!");
      console.log("Success:", response.data);
      window.location.reload();
      onClose();
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Failed to add menu item. Please try again.");
    }
  };

  return (
    <div>
      {/* <h1>Add Menu for {shop?.title || "this shop item"}</h1> */}
      <form style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw"}} onSubmit={handleSubmit}>
      <button style={{ padding: "10px 20px", background: "#ff6347", color: "#fff", border: "none", cursor: "pointer", borderRadius: "5px" }} onClick={onClose}>Close</button>
        <input type="text" name="name" placeholder="Item Name" value={menuItem.name} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }}/>
        <input type="text" name="image" placeholder="Image URL" value={menuItem.image} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }} />
        <input type="text" name="description" placeholder="Description" value={menuItem.description} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }} />
        <input type="text" name="email" placeholder="email" value={menuItem.email} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }} />
        <input type="text" name="password" placeholder="password" value={menuItem.password} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }} />
        <input type="text" name="shopconpassword" placeholder="conferm password" value={menuItem.shopconpassword} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }} />
        <input type="text" name="role" placeholder="role" value={menuItem.role} onChange={handleChange} required style={{ padding: "10px", margin: "5px", width: "100%" }} />
        <button type="submit" style={{ padding: "3px 20px", background: "linear-gradient(to right,rgb(254, 105, 79),rgb(254, 30, 0)", color: "#fff", border: "none", cursor: "pointer", borderRadius: "5px" }}>Add Shop's</button>
      </form>
    </div>
  );
};

export default MenuModal;