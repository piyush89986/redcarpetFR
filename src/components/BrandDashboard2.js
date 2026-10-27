import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar, Button, StatCard, Modal, SkeletonBrandGrid } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const BrandDashboard2 = () => {
  const { id: paramId } = useParams();
  const storedShopId = localStorage.getItem("shopId");
  const userRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const navigate = useNavigate();

  // Enforce access control: Admin can only access their own mall
  useEffect(() => {
    if (userRole === "admin" && storedShopId && paramId && paramId !== storedShopId) {
      console.warn("Access Restricted: Admin can only manage their own assigned mall.");
      navigate(`/branddashboard2/${storedShopId}`, { replace: true });
    }
  }, [userRole, storedShopId, paramId, navigate]);

  const id = userRole === "admin" && storedShopId ? storedShopId : (paramId || storedShopId);

  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Direct QR Assignment
  const [selectedShopForQr, setSelectedShopForQr] = useState(null);
  const [assignedQrUrl, setAssignedQrUrl] = useState("");
  const [isSavingQr, setIsSavingQr] = useState(false);
  const [qrSaveMsg, setQrSaveMsg] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const qrCanvasRef = useRef(null);

  // Modal State for Add Brand / Shop
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);
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
  const [newBrandForm, setNewBrandForm] = useState(initialBrandState);

  // Modal State for Edit Shop
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [editFormData, setEditFormData] = useState(initialBrandState);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchShopDetails = useCallback(async () => {
    if (!id || id === "undefined") {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/api/shops/${id}`);
      setShop(res.data);
    } catch (err) {
      console.error("Error fetching mall details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchShopDetails();
  }, [fetchShopDetails]);

  const filteredMenuItems =
    shop?.menuItems?.filter(
      (menuItem) =>
        menuItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menuItem.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const BASE_QR_URL = "https://redcarpet-fr-git-main-piyush-singh-tanwar-s-projects.vercel.app";

  // Open Direct QR Assignment Modal
  const openQrModal = async (item) => {
    setSelectedShopForQr(item);
    setQrSaveMsg("");
    const defaultUrl = `${BASE_QR_URL}/${item._id}`;
    setAssignedQrUrl(defaultUrl);

    try {
      const res = await axios.get(`${API_BASE}/api/qrcode/${item._id}`);
      if (res.data?.success && res.data.data?.qrUrl) {
        let url = res.data.data.qrUrl;
        if (url.includes("localhost") || url.includes("127.0.0.1")) {
          url = `${BASE_QR_URL}/${item._id}`;
        }
        setAssignedQrUrl(url);
      }
    } catch (err) {
      console.log("No custom QR yet, using default shop pass link");
    }
  };

  // Save Assigned QR Code to Database
  const handleSaveAssignedQr = async () => {
    if (!selectedShopForQr) return;
    setIsSavingQr(true);
    setQrSaveMsg("");

    try {
      await axios.post(`${API_BASE}/api/qrcode/${selectedShopForQr._id}`, {
        qrUrl: assignedQrUrl.trim(),
        size: 240,
      });
      setQrSaveMsg(`QR Code successfully assigned to ${selectedShopForQr.name}!`);
      setTimeout(() => setQrSaveMsg(""), 4000);
      fetchShopDetails();
    } catch (err) {
      console.error("Error saving QR:", err);
      setQrSaveMsg("Error saving QR code. Please try again.");
    } finally {
      setIsSavingQr(false);
    }
  };

  // Download QR PNG
  const handleDownloadQr = () => {
    const canvas = qrCanvasRef.current ? qrCanvasRef.current.querySelector("canvas") : null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const safeName = (selectedShopForQr?.name || "shop").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${safeName}-vip-qr.png`;
    a.click();
  };

  const handleCopyQrLink = () => {
    if (!assignedQrUrl) return;
    navigator.clipboard.writeText(assignedQrUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Add Brand / Shop Handler
  const handleAddBrandSubmit = async (e) => {
    e.preventDefault();
    if (!shop?._id) return;
    setIsSubmittingBrand(true);

    try {
      await axios.post(`${API_BASE}/api/shops/${shop._id}/menu`, {
        ...newBrandForm,
        role: "shop admin",
      });
      setIsAddModalOpen(false);
      setNewBrandForm(initialBrandState);
      fetchShopDetails();
      alert(`Store "${newBrandForm.name}" created successfully! You can now assign its QR code.`);
    } catch (err) {
      console.error("Error adding brand:", err.response?.data || err.message);
      alert("Failed to add shop. Please check required fields.");
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingShop(item);
    setEditFormData({
      name: item.name || "",
      image: item.image || "",
      description: item.description || "",
      link: item.link || "a",
      email: item.email || "",
      password: "",
      shopconpassword: "",
      role: item.role || "shop admin",
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit Shop
  const handleEditShopSubmit = async (e) => {
    e.preventDefault();
    if (!editingShop || !id) return;
    setIsSubmittingEdit(true);

    try {
      await axios.put(`${API_BASE}/api/shops/update-menu-item/${id}/${editingShop.name}`, {
        newName: editFormData.name,
        newDescription: editFormData.description,
        newImage: editFormData.image,
        newLink: editFormData.link,
        newEmail: editFormData.email,
        newPassword: editFormData.password,
        newShopConPassword: editFormData.shopconpassword,
        newRole: editFormData.role || "shop admin",
      });
      setIsEditModalOpen(false);
      setEditingShop(null);
      fetchShopDetails();
      alert(`Store "${editFormData.name}" updated successfully!`);
    } catch (err) {
      console.error("Error updating brand:", err);
      alert("Failed to update store.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Shop Handler
  const handleDeleteShop = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from this mall?`)) {
      try {
        await axios.delete(`${API_BASE}/api/shops/delete-menu-item/${id}/${item.name}`);
        fetchShopDetails();
      } catch (err) {
        console.error("Error deleting shop:", err);
        alert("Failed to delete store.");
      }
    }
  };

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
      {/* Reusable White & Blue Navbar */}
      <Navbar
        brandBadge="Mall Manager"
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search brands and stores..."
        actions={
          <>
            {userRole === "superadmin" && (
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
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/qrcode?mallId=${id}`)}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              }
            >
              Shop QR Studio
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/${id}/counter`)}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            >
              Mall Counter
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setNewBrandForm(initialBrandState);
                setIsAddModalOpen(true);
              }}
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
        {/* Mall Header Card */}
        {shop && (
          <div
            style={{
              background: "var(--rc-white)",
              border: "1px solid var(--rc-border)",
              borderRadius: "var(--rc-radius-xl)",
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "24px",
              marginBottom: "32px",
              boxShadow: "var(--rc-shadow-sm)",
              flexWrap: "wrap",
            }}
          >
            <div
              className="rc-avatar-monogram"
              style={{
                width: "68px",
                height: "68px",
                fontSize: "26px",
                borderRadius: "16px",
              }}
            >
              {(shop.title || "M").substring(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <span className="rc-brand-badge" style={{ marginBottom: "6px", display: "inline-block" }}>
                Mall Destination
              </span>
              <h1 style={{ fontSize: "24px", fontWeight: 800, margin: "0 0 6px 0", color: "var(--rc-text-main)" }}>
                {shop.title}
              </h1>
              <p style={{ margin: 0, color: "var(--rc-text-muted)", fontSize: "14px" }}>
                {shop.description || "Discover premium brands, dining spots, and customer queue passes."}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/qrcode?shopId=${id}`)}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                }
              >
                Mall Main QR
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setNewBrandForm(initialBrandState);
                  setIsAddModalOpen(true);
                }}
              >
                + Add Shop
              </Button>
            </div>
          </div>
        )}

        {/* Stats Row in White & Blue */}
        <section className="rc-stats-grid">
          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
            label="Total Registered Brands"
            value={shop?.menuItems?.length || 0}
            sub="Stores in this complex"
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            label="Filtered Results"
            value={filteredMenuItems.length}
            sub={searchQuery ? `Matching "${searchQuery}"` : "All stores"}
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label="Queue Reset Cycle"
            value="Daily (Start #1)"
            sub="Per-shop isolated lines"
          />
        </section>

        {/* Section Heading */}
        <div className="rc-section-header">
          <div>
            <h2 className="rc-section-title">Brand Directory &amp; Store QR Assignment</h2>
            <p className="rc-section-desc">
              Assign distinct QR codes to each shop. When scanned by a customer, passes post directly to that shop's Live Counter Queue.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setNewBrandForm(initialBrandState);
              setIsAddModalOpen(true);
            }}
          >
            + Register New Store
          </Button>
        </div>

        {/* Brands Grid */}
        {isLoading ? (
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
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>No Brands Found</h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
              {searchQuery
                ? `No brands matching "${searchQuery}".`
                : "No stores have been added to this mall yet. Add your first shop below!"}
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setNewBrandForm(initialBrandState);
                setIsAddModalOpen(true);
              }}
            >
              + Add First Shop / Brand
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
                    {item.description || "Official brand counter for VIP queue and checkout passes."}
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
                      onClick={() => navigate(`/${item._id}/counter`)}
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
                      onClick={() => openQrModal(item)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      }
                      title="Assign and generate QR code for this shop"
                    >
                      Assign QR
                    </Button>

                    <Button
                      variant="outline"
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
                      onClick={() => handleDeleteShop(item)}
                      icon={
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      }
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

      {/* Direct QR Code Assignment Modal for Admin */}
      {selectedShopForQr && (
        <Modal
          isOpen={!!selectedShopForQr}
          onClose={() => setSelectedShopForQr(null)}
          title={`Assign QR Code: ${selectedShopForQr.name}`}
          subtitle={`Admin QR manager for ${shop?.title || "this mall"}`}
          maxWidth="560px"
        >
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            {/* Live QR Preview */}
            <div
              ref={qrCanvasRef}
              style={{
                display: "inline-block",
                padding: "16px",
                background: "#ffffff",
                border: "2px solid var(--rc-blue-200)",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
                marginBottom: "20px",
              }}
            >
              <QRCodeCanvas
                value={assignedQrUrl || `${BASE_QR_URL}/${selectedShopForQr._id}`}
                size={200}
                fgColor="#000000"
                bgColor="#ffffff"
                level="H"
                includeMargin={true}
              />
            </div>

            <p style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px 0", color: "var(--rc-text-main)" }}>
              {selectedShopForQr.name}
            </p>
            <p style={{ fontSize: "12px", color: "var(--rc-text-muted)", margin: "0 0 20px 0" }}>
              Scanning this QR automatically creates VIP passes in {selectedShopForQr.name}'s Live Counter Queue.
            </p>

            {/* Editable Destination URL */}
            <div style={{ textAlign: "left", marginBottom: "16px" }}>
              <label className="rc-label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Assigned Destination Link *</span>
                <span
                  style={{ color: "var(--rc-blue-600)", cursor: "pointer", textDecoration: "underline", fontSize: "12px" }}
                  onClick={() => setAssignedQrUrl(`${BASE_QR_URL}/${selectedShopForQr._id}`)}
                >
                  Reset Default
                </span>
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  className="rc-input"
                  value={assignedQrUrl}
                  onChange={(e) => setAssignedQrUrl(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
                <Button variant="outline" size="sm" onClick={handleCopyQrLink}>
                  {isCopied ? "Copied" : "Copy"}
                </Button>
                <a
                  href={assignedQrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rc-btn rc-btn-outline rc-btn-sm"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                >
                  Test ↗
                </a>
              </div>
            </div>

            {/* Feedback message */}
            {qrSaveMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: qrSaveMsg.includes("success") ? "#ecfdf5" : "#fef2f2",
                  color: qrSaveMsg.includes("success") ? "#047857" : "#b91c1c",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "16px",
                  border: `1px solid ${qrSaveMsg.includes("success") ? "#a7f3d0" : "#fecaca"}`,
                }}
              >
                {qrSaveMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <Button
                variant="primary"
                onClick={handleSaveAssignedQr}
                disabled={isSavingQr}
                style={{ width: "100%" }}
              >
                {isSavingQr ? "Saving..." : "Save & Assign QR"}
              </Button>
              <Button variant="outline" onClick={handleDownloadQr} style={{ width: "100%" }}>
                Download QR PNG
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Shop / Brand Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Shop / Counter"
          subtitle={`Admin tool to add a brand or counter under ${shop?.title || "this mall"}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" form="add-shop-form" disabled={isSubmittingBrand}>
                {isSubmittingBrand ? "Creating..." : "Create Shop"}
              </Button>
            </>
          }
        >
          <form
            id="add-shop-form"
            onSubmit={handleAddBrandSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label className="rc-label">Shop / Brand Name *</label>
              <input
                type="text"
                className="rc-input"
                placeholder="e.g. Zara, Starbucks, Nike"
                value={newBrandForm.name}
                onChange={(e) => setNewBrandForm({ ...newBrandForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="rc-label">Cover Image URL</label>
              <input
                type="text"
                className="rc-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={newBrandForm.image}
                onChange={(e) => setNewBrandForm({ ...newBrandForm, image: e.target.value })}
              />
            </div>

            <div>
              <label className="rc-label">Description / Offer</label>
              <textarea
                className="rc-input"
                rows={2}
                placeholder="Official store counter for VIP fast checkout"
                value={newBrandForm.description}
                onChange={(e) => setNewBrandForm({ ...newBrandForm, description: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="rc-label">Shop Admin Staff Email *</label>
                <input
                  type="email"
                  className="rc-input"
                  placeholder="counter@zara.com"
                  value={newBrandForm.email}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="rc-label">Staff Login Password *</label>
                <input
                  type="password"
                  className="rc-input"
                  placeholder="******"
                  value={newBrandForm.password}
                  onChange={(e) => setNewBrandForm({ ...newBrandForm, password: e.target.value })}
                  required
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Shop Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Store: ${editingShop?.name}`}
          subtitle={`Update brand details for ${shop?.title || "this mall"}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" form="edit-shop-form" disabled={isSubmittingEdit}>
                {isSubmittingEdit ? "Updating..." : "Save Changes"}
              </Button>
            </>
          }
        >
          <form
            id="edit-shop-form"
            onSubmit={handleEditShopSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label className="rc-label">Shop / Brand Name *</label>
              <input
                type="text"
                className="rc-input"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="rc-label">Cover Image URL</label>
              <input
                type="text"
                className="rc-input"
                value={editFormData.image}
                onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
              />
            </div>

            <div>
              <label className="rc-label">Description / Offer</label>
              <textarea
                className="rc-input"
                rows={2}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="rc-label">Staff Login Email</label>
                <input
                  type="email"
                  className="rc-input"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="rc-label">Update Password (optional)</label>
                <input
                  type="password"
                  className="rc-input"
                  placeholder="Leave blank to keep current"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BrandDashboard2;
