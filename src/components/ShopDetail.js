import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar, Button, StatCard, Modal, SkeletonBrandGrid } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const ShopDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const storedShopId = localStorage.getItem("shopId");

  useEffect(() => {
    if (userRole === "admin" && storedShopId && id !== storedShopId) {
      console.warn("Access Restricted: Admin can only view their own mall.");
      navigate(`/branddashboard2/${storedShopId}`, { replace: true });
    }
  }, [userRole, storedShopId, id, navigate]);

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
    role: "shop admin",
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
      role: item.role || item.editedrole || "shop admin",
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

  // If subscription is expired/inactive, block mall dashboard and show expired page
  if (shop && shop.subscriptionStatus === "inactive") {
    return (
      <div className="rc-page-container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
        <Navbar brandBadge="Subscription Notice" />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
          <div
            style={{
              maxWidth: "520px",
              width: "100%",
              background: "#ffffff",
              borderRadius: "24px",
              padding: "48px 36px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
              border: "1px solid #fee2e2",
            }}
          >
            <div
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px auto",
                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.15)",
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            </div>

            <span
              style={{
                display: "inline-block",
                background: "#fee2e2",
                color: "#991b1b",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "16px",
              }}
            >
              Account Suspended
            </span>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 12px 0",
                letterSpacing: "-0.5px",
              }}
            >
              Your Subscription Has Expired
            </h1>

            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                lineHeight: "1.6",
                margin: "0 0 28px 0",
              }}
            >
              Access to <strong>{shop.title || "this mall"}</strong> and its active counter queues has been paused by platform administration.
            </p>

            <div
              style={{
                padding: "16px 20px",
                background: "#f8fafc",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                color: "#475569",
                marginBottom: "28px",
                textAlign: "left",
                lineHeight: "1.5",
              }}
            >
              <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
                Need to reactivate your account?
              </div>
              Please contact the RedCarpet administration team or renew your monthly subscription to resume full service.
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              {userRole === "superadmin" ? (
                <Button
                  variant="primary"
                  onClick={() => navigate("/ownerdashboard")}
                  style={{ padding: "12px 24px" }}
                >
                  SuperAdmin Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/");
                  }}
                  style={{ padding: "12px 24px" }}
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {userRole === "superadmin" ? (
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
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/branddashboard2/${storedShopId}`)}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                }
              >
                Mall Dashboard
              </Button>
            )}
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
          <SkeletonBrandGrid count={6} />
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
              <article key={item._id || index} className="rc-card-clean">
                <div className="rc-card-clean-header">
                  <div className="rc-clean-avatar-wrap">
                    <div className="rc-avatar-monogram">
                      {(item.name || "S").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="rc-clean-header-meta">
                      <h3 className="rc-clean-title">{item.name}</h3>
                      <span className="rc-clean-subtitle">{item.role || "Shop Admin"}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "9999px",
                      background: "var(--rc-blue-50)",
                      color: "var(--rc-blue-700)",
                      border: "1px solid var(--rc-blue-200)",
                    }}
                  >
                    Active
                  </span>
                </div>

                <div className="rc-card-clean-body">
                  <p className="rc-card-clean-desc">
                    {item.description || item.editeddescription || "Official brand counter for VIP queue and checkout passes."}
                  </p>

                  {item.email && (
                    <div style={{ fontSize: "12px", color: "var(--rc-text-muted)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>Staff: <strong>{item.email}</strong></span>
                    </div>
                  )}

                  <div className="rc-card-actions" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/${item._id || id}/counter`)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      }
                      title="View live counter queue for this specific shop"
                    >
                      Shop Queue
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ gridColumn: "1 / -1" }}
                      onClick={() => handleDelete(item)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      }
                    >
                      Delete Store
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
            <select
              name="role"
              className="rc-input"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="shop admin">Shop Admin (Counter Queue Lead)</option>
              <option value="admin">Admin</option>
            </select>
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
            <select
              name="role"
              className="rc-input"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="shop admin">Shop Admin (Counter Queue Lead)</option>
              <option value="admin">Admin</option>
            </select>
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
