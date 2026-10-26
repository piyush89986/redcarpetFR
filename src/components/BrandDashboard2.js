import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import { Navbar, Button, StatCard, Modal } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const BrandDashboard2 = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State for Direct QR Assignment
  const [selectedShopForQr, setSelectedShopForQr] = useState(null);
  const [assignedQrUrl, setAssignedQrUrl] = useState("");
  const [isSavingQr, setIsSavingQr] = useState(false);
  const [qrSaveMsg, setQrSaveMsg] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${API_BASE}/api/shops/${id}`)
      .then((res) => setShop(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const filteredMenuItems =
    shop?.menuItems?.filter(
      (menuItem) =>
        menuItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        menuItem.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Open Direct QR Assignment Modal
  const openQrModal = async (item) => {
    setSelectedShopForQr(item);
    setQrSaveMsg("");
    const defaultUrl = `${window.location.origin}/${item._id}`;
    setAssignedQrUrl(defaultUrl);

    try {
      const res = await axios.get(`${API_BASE}/api/qrcode/${item._id}`);
      if (res.data?.success && res.data.data?.qrUrl) {
        setAssignedQrUrl(res.data.data.qrUrl);
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

  return (
    <div className="rc-page-container">
      {/* Reusable White & Blue Navbar */}
      <Navbar
        brandBadge="Mall Showcase"
        search={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search brands and stores..."
        actions={
          <>
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
              variant="primary"
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
            <img
              src={
                shop.image ||
                "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80"
              }
              alt={shop.title}
              style={{
                width: "140px",
                height: "90px",
                objectFit: "cover",
                borderRadius: "var(--rc-radius-md)",
                border: "1px solid var(--rc-border-blue)",
              }}
            />
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
            <div>
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
            label="Total Available Brands"
            value={shop?.menuItems?.length || 0}
            sub="Curated stores"
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
            sub="Starts from 1 everyday"
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
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--rc-blue-600)" }}>
            <p style={{ fontWeight: 600 }}>Loading brand directory...</p>
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
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>No Brands Found</h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px" }}>
              {searchQuery
                ? `No brands matching "${searchQuery}".`
                : "No stores have been added to this mall yet."}
            </p>
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
                    {item.role || "Official Store"}
                  </div>
                </div>

                <div className="rc-card-body">
                  <h3 className="rc-card-title">{item.name}</h3>
                  <p className="rc-card-desc">
                    {item.description || "Visit this store for exclusive collections, offers, and fast service."}
                  </p>

                  <div className="rc-card-actions" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: "1 1 calc(50% - 4px)" }}
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
                      style={{ flex: "1 1 calc(50% - 4px)" }}
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
                value={assignedQrUrl || `${window.location.origin}/${selectedShopForQr._id}`}
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
                  onClick={() => setAssignedQrUrl(`${window.location.origin}/${selectedShopForQr._id}`)}
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
    </div>
  );
};

export default BrandDashboard2;
