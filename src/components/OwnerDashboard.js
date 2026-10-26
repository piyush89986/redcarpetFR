import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar, Button, StatCard, Modal } from "./common";
import "./common/common.css";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [shops, setFoods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initialFormState = {
    title: "",
    description: "",
    image: "",
    email: "",
    password: "",
    mallconpassword: "",
    role: "superadmin",
  };

  const [newFood, setNewFood] = useState(initialFormState);
  const [editFood, setEditFood] = useState(null);

  const apiBase =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${apiBase}/api/shops`)
      .then((res) => {
        setFoods(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching shops:", err);
      })
      .finally(() => setIsLoading(false));
  }, [apiBase]);

  const role = localStorage.getItem("role");
  useEffect(() => {
    if (role && role !== "superadmin") {
      navigate("/");
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    setNewFood({ ...newFood, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditFood(null);
    setNewFood(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (shop) => {
    setEditFood(shop);
    setNewFood({
      title: shop.title || "",
      description: shop.description || "",
      image: shop.image || "",
      email: shop.email || "",
      password: "", // keep empty unless updating
      mallconpassword: "",
      role: shop.role || "superadmin",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditFood(null);
    setNewFood(initialFormState);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editFood) {
      axios
        .put(`${apiBase}/api/shops/${editFood._id}`, newFood)
        .then((res) => {
          setFoods(
            shops.map((shop) => (shop._id === editFood._id ? res.data : shop))
          );
          closeModal();
        })
        .catch((err) => {
          console.error("Error updating shop:", err);
          alert("Failed to update mall: " + (err.response?.data?.message || err.message));
        });
    } else {
      axios
        .post(`${apiBase}/api/shops`, newFood)
        .then((res) => {
          setFoods([...shops, res.data]);
          closeModal();
        })
        .catch((err) => {
          console.error("Error creating shop:", err);
          alert("Failed to add mall: " + (err.response?.data?.message || err.message));
        });
    }
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title || "this mall"}"?`)) {
      axios
        .delete(`${apiBase}/api/shops/${id}`)
        .then(() => {
          setFoods(shops.filter((shop) => shop._id !== id));
        })
        .catch((err) => {
          console.error("Error deleting shop:", err);
          alert("Failed to delete mall: " + (err.response?.data?.message || err.message));
        });
    }
  };

  const filteredShops = shops.filter((shop) =>
    shop?.title?.toLowerCase().includes(search.toLowerCase()) ||
    shop?.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="rc-page-container">
      {/* Reusable Navbar */}
      <Navbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search malls by name or location..."
        actions={
          <Button
            variant="primary"
            onClick={openAddModal}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add New Mall
          </Button>
        }
      />

      {/* Main Content Area */}
      <main className="rc-main-content">
        {/* Reusable Stat Cards (Strict White & Blue) */}
        <section className="rc-stats-grid">
          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3l3-2 3 2" />
              </svg>
            }
            label="Total Registered Malls"
            value={shops.length}
            sub="Operational complexes"
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            label="Search Results"
            value={filteredShops.length}
            sub={search ? `Matching "${search}"` : "All records"}
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            label="System Status"
            value="Active"
            sub="Cloud sync verified"
          />
        </section>

        {/* Section Heading */}
        <div className="rc-section-header">
          <div>
            <h2 className="rc-section-title">Registered Malls & Complexes</h2>
            <p className="rc-section-desc">Manage your mall destinations, shops, and customer queue counters.</p>
          </div>
          <Button variant="outline" onClick={openAddModal}>
            + Register Mall
          </Button>
        </div>

        {/* Mall Cards Grid */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--rc-blue-600)" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>⏳</div>
            <p style={{ fontWeight: 600 }}>Loading malls and complexes...</p>
          </div>
        ) : filteredShops.length === 0 ? (
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
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏢</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>No Malls Found</h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              {search
                ? `No results matching "${search}". Try searching another name.`
                : "No malls registered yet. Click below to add your first mall!"}
            </p>
            <Button variant="primary" onClick={openAddModal}>
              + Add New Mall Now
            </Button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
            {filteredShops.map((shop) => (
              <article key={shop._id} className="rc-card">
                {/* Image & Overlay Badge */}
                <div className="rc-card-media">
                  <img
                    src={
                      shop.image ||
                      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={shop.title || "Mall Cover"}
                    className="rc-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="rc-card-badge">
                    {shop.role === "superadmin" ? "SuperAdmin Hub" : "Active Mall"}
                  </div>
                </div>

                {/* Card Content */}
                <div className="rc-card-body">
                  <h3 className="rc-card-title">{shop.title || "Unnamed Mall"}</h3>

                  {shop.description && (
                    <p className="rc-card-desc">{shop.description}</p>
                  )}

                  {/* Metadata Row */}
                  <div className="rc-card-meta">
                    {shop.description && (
                      <div className="rc-meta-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{shop.description}</span>
                      </div>
                    )}
                    {shop.email && (
                      <div className="rc-meta-item">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span>{shop.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="rc-card-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/shop/${shop._id}`)}
                      icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      }
                    >
                      Manage Shops
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(shop)}
                      title="Edit Mall Details"
                    >
                      Edit
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(shop._id, shop.title)}
                      title="Delete Mall"
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

      {/* Reusable Modal for Add / Edit Mall */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editFood ? `Edit "${editFood.title}"` : "Register New Mall Complex"}
        subtitle={editFood ? "Update mall configuration & credentials" : "Enter details to create a new mall complex"}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form="mall-form">
              {editFood ? "Save Changes" : "Create Mall Complex"}
            </Button>
          </>
        }
      >
        <form id="mall-form" onSubmit={handleSubmit} className="rc-form-grid">
          <div className="rc-form-group">
            <label className="rc-label">Mall Title / Name *</label>
            <input
              type="text"
              name="title"
              className="rc-input"
              placeholder="e.g. Phoenix Marketcity"
              value={newFood.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Location / Address *</label>
            <input
              type="text"
              name="description"
              className="rc-input"
              placeholder="e.g. Dewas Road, Indore"
              value={newFood.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rc-form-group rc-form-group-full">
            <label className="rc-label">Cover Image URL *</label>
            <input
              type="text"
              name="image"
              className="rc-input"
              placeholder="https://images.unsplash.com/..."
              value={newFood.image}
              onChange={handleChange}
              required
            />
            {newFood.image && (
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--rc-text-muted)" }}>Preview:</span>
                <img
                  src={newFood.image}
                  alt="Preview"
                  style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid var(--rc-border-blue)" }}
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Admin Email *</label>
            <input
              type="email"
              name="email"
              className="rc-input"
              placeholder="admin@mall.com"
              value={newFood.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">Role Access</label>
            <select
              name="role"
              className="rc-input"
              value={newFood.role}
              onChange={handleChange}
            >
              <option value="superadmin">SuperAdmin</option>
              <option value="owner">Mall Manager / Owner</option>
            </select>
          </div>

          <div className="rc-form-group">
            <label className="rc-label">
              {editFood ? "New Password (Optional)" : "Password *"}
            </label>
            <input
              type="password"
              name="password"
              className="rc-input"
              placeholder="••••••••"
              value={newFood.password}
              onChange={handleChange}
              required={!editFood}
            />
          </div>

          <div className="rc-form-group">
            <label className="rc-label">
              {editFood ? "Confirm New Password" : "Confirm Password *"}
            </label>
            <input
              type="password"
              name="mallconpassword"
              className="rc-input"
              placeholder="••••••••"
              value={newFood.mallconpassword}
              onChange={handleChange}
              required={!editFood}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OwnerDashboard;
