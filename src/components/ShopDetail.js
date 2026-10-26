import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar, Button, StatCard, Modal } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Add Brand/Shop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const initialBrandState = {
    name: "",
    image: "",
    description: "",
    link: "a",
    email: "",
    password: "",
    shopconpassword: "",
    role: "admin",
  };

  const [formData, setFormData] = useState(initialBrandState);

  const apiBase = API_BASE;

  const fetchShopDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBase}/api/shops/${id}`);
      setShop(response.data);
    } catch (error) {
      console.error("Error fetching shop details:", error);
    } finally {
      setLoading(false);
    }
  }, [apiBase, id]);

  useEffect(() => {
    fetchShopDetails();
  }, [fetchShopDetails]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData(initialBrandState);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      image: item.image || "",
      description: item.description || item.editeddescription || "",
      link: item.link || "a",
      email: item.email || item.editedemail || "",
      password: "", // empty for security unless editing
      shopconpassword: "",
      role: item.role || item.editedrole || "admin",
    });
    setIsEditModalOpen(true);
  };

  // Add Brand Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!shop?._id) return;

    try {
      await axios.post(`${apiBase}/api/shops/${shop._id}/menu`, formData);
      setIsAddModalOpen(false);
      setFormData(initialBrandState);
      fetchShopDetails();
    } catch (err) {
      console.error("Error adding brand:", err.response?.data || err.message);
      alert("Failed to add shop/brand. Please try again.");
    }
  };

  // Edit Brand Save
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const response = await axios.put(
        `${apiBase}/api/shops/update-menu-item/${id}/${editingItem.name}`,
        {
          newName: formData.name,
          newLink: formData.link,
          newImage: formData.image,
          newDescription: formData.description,
          newEmail: formData.email,
          newPassword: formData.password,
          newShopConPassword: formData.shopconpassword,
          newRole: formData.role,
        }
      );

      if (response.data.success) {
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchShopDetails();
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      alert("Failed to update brand.");
    }
  };

  // Delete Brand
  const handleDelete = async (menuItem) => {
    if (window.confirm(`Are you sure you want to delete "${menuItem.name}"?`)) {
      try {
        const response = await axios.delete(
          `${apiBase}/api/shops/delete-menu-item/${id}/${menuItem.name}`
        );
        if (response.data.success) {
          fetchShopDetails();
        }
      } catch (error) {
        console.error("Error deleting brand:", error);
        alert("Failed to delete brand.");
      }
    }
  };

  const filteredMenuItems = shop?.menuItems
    ? shop.menuItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="rc-page-container">
      {/* Reusable Navbar */}
      <Navbar
        brandBadge="Mall Manager"
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search shops and counters..."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/ownerdashboard")}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              }
            >
              All Malls
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={openAddModal}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              Add New Shop
            </Button>
          </>
        }
      />

      <main className="rc-main-content">
        {/* Mall Overview Stats */}
        <section className="rc-stats-grid">
          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3l3-2 3 2" />
              </svg>
            }
            label="Selected Mall Complex"
            value={shop?.title || "Loading..."}
            sub={shop?.description || "Active Complex"}
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
            label="Total Brands & Shops"
            value={shop?.menuItems?.length || 0}
            sub={`${filteredMenuItems.length} displayed`}
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label="Counter Live Sync"
            value="Ready"
            sub="Queue dispatch operational"
          />
        </section>

        {/* Section Heading */}
        <div className="rc-section-header">
          <div>
            <h2 className="rc-section-title">
              Shops & Counters in {shop?.title || "Mall"}
            </h2>
            <p className="rc-section-desc">
              Manage brands, assign counter managers, and launch live queue dispatchers.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="outline"
              onClick={() => navigate(`/${id}/counter`)}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            >
              Open Queue Counter
            </Button>
            <Button variant="primary" onClick={openAddModal}>
              + Add Shop / Brand
            </Button>
          </div>
        </div>

        {/* Brand / Shop Cards Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--rc-blue-600)" }}>
            <p style={{ fontWeight: 600 }}>Loading mall shops...</p>
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div
            style={{
              background: "var(--rc-white)",
              border: "1px dashed var(--rc-blue-200)",
              borderRadius: "var(--rc-radius-xl)",
              padding: "60px 24px",
              textAlign: "center",
              maxWidth: "500px",
              margin: "40px auto",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🛍️</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>No Shops Added Yet</h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              {searchQuery
                ? `No shops matching "${searchQuery}".`
                : "Add brands and stores to this mall to enable counter queues and orders."}
            </p>
            <Button variant="primary" onClick={openAddModal}>
              + Add First Shop
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "22px" }}>
            {filteredMenuItems.map((item, index) => (
              <article key={index} className="rc-card">
                <div className="rc-card-media">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={item.name}
                    className="rc-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="rc-card-badge">
                    {item.role || "Brand Shop"}
                  </div>
                </div>

                <div className="rc-card-body">
                  <h3 className="rc-card-title">{item.name}</h3>
                  <p className="rc-card-desc">
                    {item.description || item.editeddescription || "No description provided."}
                  </p>

                  <div className="rc-card-meta">
                    {item.email && (
                      <div className="rc-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{item.email}</span>
                      </div>
                    )}
                    <div className="rc-meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Credentials Configured</span>
                    </div>
                  </div>

                  <div className="rc-card-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/${id}/counter`)}
                    >
                      Open Counter
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Add Brand Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Shop / Brand"
        subtitle={`Register a brand or counter under ${shop?.title || "this mall"}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="add-brand-form">
              Add Shop
            </Button>
          </>
        }
      >
        <form id="add-brand-form" onSubmit={handleAddSubmit} className="rc-form-grid">
          <div className="rc-form-group">
            <label className="rc-label">Shop / Brand Name *</label>
            <input
              type="text"
              name="name"
              className="rc-input"
              placeholder="e.g. Starbucks or Zara"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Cover Image URL *</label>
            <input
              type="text"
              name="image"
              className="rc-input"
              placeholder="https://images.unsplash.com/..."
              value={formData.image}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group rc-form-group-full">
            <label className="rc-label">Description *</label>
            <input
              type="text"
              name="description"
              className="rc-input"
              placeholder="Short description of store and items"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Shop Manager Email *</label>
            <input
              type="email"
              name="email"
              className="rc-input"
              placeholder="store@brand.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Role Access</label>
            <input
              type="text"
              name="role"
              className="rc-input"
              placeholder="owner / manager"
              value={formData.role}
              onChange={handleInputChange}
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Password *</label>
            <input
              type="password"
              name="password"
              className="rc-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Confirm Password *</label>
            <input
              type="password"
              name="shopconpassword"
              className="rc-input"
              placeholder="••••••••"
              value={formData.shopconpassword}
              onChange={handleInputChange}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Edit Brand Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit "${editingItem?.name}"`}
        subtitle="Update brand information and counter access"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="edit-brand-form">
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-brand-form" onSubmit={handleEditSubmit} className="rc-form-grid">
          <div className="rc-form-group">
            <label className="rc-label">Shop / Brand Name *</label>
            <input
              type="text"
              name="name"
              className="rc-input"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Cover Image URL *</label>
            <input
              type="text"
              name="image"
              className="rc-input"
              value={formData.image}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group rc-form-group-full">
            <label className="rc-label">Description *</label>
            <input
              type="text"
              name="description"
              className="rc-input"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Shop Manager Email *</label>
            <input
              type="email"
              name="email"
              className="rc-input"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Role Access</label>
            <input
              type="text"
              name="role"
              className="rc-input"
              value={formData.role}
              onChange={handleInputChange}
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">New Password (Leave blank to keep)</label>
            <input
              type="password"
              name="password"
              className="rc-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Confirm Password</label>
            <input
              type="password"
              name="shopconpassword"
              className="rc-input"
              placeholder="••••••••"
              value={formData.shopconpassword}
              onChange={handleInputChange}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShopDetail;
