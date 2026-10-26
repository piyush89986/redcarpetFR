import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Navbar, Button } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";
import "./QrCode.css";

const QRGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [shopsData, setShopsData] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [text, setText] = useState("");
  const [size, setSize] = useState(240);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [copied, setCopied] = useState(false);

  const qrRef = useRef(null);
  const dropdownRef = useRef(null);

  const apiBase = API_BASE;
  const userRole = localStorage.getItem("role") || "admin";
  const userShopId = localStorage.getItem("shopId") || "";

  // Strict Black and White standard
  const fgColor = "#000000";
  const bgColor = "#ffffff";

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Build flattened list of targets (Malls + Individual Shops)
  const allTargets = useMemo(() => {
    const targets = [];
    shopsData.forEach((mall) => {
      // If admin and user has a specific mall, can filter or keep all
      const isMallForAdmin = !userShopId || mall._id === userShopId || userRole === "superadmin";

      // Top-level Mall
      if (mall.title && isMallForAdmin) {
        targets.push({
          id: mall._id,
          name: mall.title,
          type: "mall",
          category: "Mall Counter",
          mallName: mall.title,
          image: mall.image,
          description: mall.description || `Mall ID: ${mall._id}`,
        });

        // Individual Shops inside this Mall
        if (Array.isArray(mall.menuItems)) {
          mall.menuItems.forEach((store) => {
            if (store._id && store.name) {
              targets.push({
                id: store._id,
                name: store.name,
                type: "shop",
                category: `Shop in ${mall.title}`,
                mallName: mall.title,
                mallId: mall._id,
                image: store.image || mall.image,
                description: store.description || `Store inside ${mall.title}`,
              });
            }
          });
        }
      }
    });
    return targets;
  }, [shopsData, userRole, userShopId]);

  const BASE_QR_URL = "https://redcarpet-fr-git-main-piyush-singh-tanwar-s-projects.vercel.app";

  // Load a target's saved QR settings from DB
  const loadTargetQR = useCallback(
    async (targetId) => {
      if (!targetId) return;
      setSelectedTargetId(targetId);
      setIsDropdownOpen(false);
      setSearchQuery("");
      setSaveSuccessMsg("");
      setSaveErrorMsg("");

      const defaultUrl = `${BASE_QR_URL}/${targetId}`;
      setText(defaultUrl);
      setIsSaved(true);

      try {
        const res = await axios.get(`${apiBase}/api/qrcode/${targetId}`);
        if (res.data?.success && res.data.data?.qrUrl) {
          let url = res.data.data.qrUrl;
          if (url.includes("localhost") || url.includes("127.0.0.1")) {
            url = `${BASE_QR_URL}/${targetId}`;
          }
          setText(url);
          if (res.data.data.size) {
            setSize(Number(res.data.data.size));
          }
        }
      } catch (err) {
        console.log("No custom QR saved yet, using default welcome link:", err.message);
      }
    },
    [apiBase]
  );

  // Fetch all malls on mount & check query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const queryShopId = searchParams.get("shopId");
    const queryMallId = searchParams.get("mallId");

    axios
      .get(`${apiBase}/api/shops`)
      .then((res) => {
        const validMalls = (res.data || []).filter((s) => s.title);
        setShopsData(validMalls);

        // Determine which target to select first
        if (queryShopId) {
          loadTargetQR(queryShopId);
        } else if (queryMallId) {
          loadTargetQR(queryMallId);
        } else if (userShopId) {
          loadTargetQR(userShopId);
        } else if (validMalls.length > 0) {
          loadTargetQR(validMalls[0]._id);
        }
      })
      .catch((err) => console.log("Failed to fetch shops for QR:", err.message));
  }, [apiBase, location.search, userShopId, loadTargetQR]);

  const selectedTarget = allTargets.find((t) => t.id === selectedTargetId);

  // Filter targets by search
  const filteredTargets = allTargets.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Save current QR settings to Database
  const handleSaveToDb = async () => {
    if (!selectedTargetId) {
      setSaveErrorMsg("Please select a mall or shop first.");
      return;
    }
    if (!text.trim()) {
      setSaveErrorMsg("Destination URL cannot be empty.");
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg("");
    setSaveErrorMsg("");

    try {
      const res = await axios.post(`${apiBase}/api/qrcode/${selectedTargetId}`, {
        qrUrl: text.trim(),
        size: Number(size),
      });

      if (res.data?.success) {
        setIsSaved(true);
        const name = selectedTarget?.name || "Target";
        setSaveSuccessMsg(`QR Code for "${name}" saved to database successfully!`);
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      } else {
        setSaveErrorMsg(res.data?.message || "Failed to save QR configuration.");
      }
    } catch (err) {
      console.error("Save error:", err);
      setSaveErrorMsg(err.response?.data?.message || "Error saving to database.");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy destination link
  const handleCopyLink = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset to Default Welcome Page
  const handleResetToDefault = () => {
    if (!selectedTargetId) return;
    const defaultUrl = `${BASE_QR_URL}/${selectedTargetId}`;
    setText(defaultUrl);
    setIsSaved(false);
  };

  // Download high-resolution PNG
  const downloadQR = () => {
    const canvas = qrRef.current ? qrRef.current.querySelector("canvas") : null;
    if (!canvas) {
      alert("Please enter text or a link first to generate a QR code!");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const fileName = selectedTarget
      ? `${selectedTarget.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-qr.png`
      : "redcarpet-qrcode.png";
    a.download = fileName;
    a.click();
  };

  // Back button routing
  const handleBackToDashboard = () => {
    if (userRole === "superadmin") {
      navigate("/ownerdashboard");
    } else {
      const backMallId = userShopId || selectedTarget?.mallId || selectedTargetId;
      navigate(backMallId ? `/branddashboard2/${backMallId}` : "/");
    }
  };

  return (
    <div className="rc-qr-page-container">
      {/* Reusable White & Blue Navbar */}
      <Navbar
        brandBadge="QR Studio"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToDashboard}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            }
          >
            {userRole === "superadmin" ? "All Malls" : "Mall Dashboard"}
          </Button>
        }
      />

      <main className="rc-qr-wrapper">
        {/* Header Section */}
        <div className="rc-qr-header">
          <div className="rc-qr-badge">Official QR Pass Generator</div>
          <h1 className="rc-qr-title">Store &amp; Mall QR Studio</h1>
          <p className="rc-qr-sub">
            Generate and assign high-resolution Black &amp; White QR passes for individual shops and mall counters. Each shop has its own QR pass and Live Counter Queue.
          </p>
        </div>

        {/* Generator Card */}
        <div className="rc-qr-card">
          {/* Left Controls */}
          <div className="rc-qr-controls">
            {/* Target Selector Dropdown */}
            <div className="rc-form-group">
              <label
                className="rc-label"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <span>Select Shop or Mall *</span>
                <span className={`rc-status-tag ${isSaved ? "rc-status-saved" : "rc-status-unsaved"}`}>
                  {isSaved ? "● Saved in DB" : "● Unsaved Changes"}
                </span>
              </label>

              <div className="rc-custom-dropdown-wrap" ref={dropdownRef}>
                <button
                  type="button"
                  className={`rc-dropdown-trigger ${isDropdownOpen ? "open" : ""}`}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <div className="rc-dropdown-selected-left">
                    <div className="rc-mall-thumb">
                      {selectedTarget?.image ? (
                        <img src={selectedTarget.image} alt={selectedTarget.name} />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                          <line x1="8" y1="6" x2="8" y2="6.01" />
                          <line x1="12" y1="6" x2="12" y2="6.01" />
                          <line x1="16" y1="6" x2="16" y2="6.01" />
                        </svg>
                      )}
                    </div>
                    <div className="rc-dropdown-text">
                      <span className="rc-dropdown-mall-title">
                        {selectedTarget ? selectedTarget.name : "-- Choose a Shop or Mall --"}
                      </span>
                      <span className="rc-dropdown-mall-desc">
                        {selectedTarget ? selectedTarget.category : "Click to select a store"}
                      </span>
                    </div>
                  </div>
                  <div className={`rc-dropdown-chevron ${isDropdownOpen ? "open" : ""}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu Popup */}
                {isDropdownOpen && (
                  <div className="rc-dropdown-menu">
                    <div className="rc-dropdown-search-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search store or mall name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rc-dropdown-search-input"
                      />
                    </div>

                    <div className="rc-dropdown-items-list">
                      {filteredTargets.length > 0 ? (
                        filteredTargets.map((target) => {
                          const isSelected = target.id === selectedTargetId;
                          return (
                            <div
                              key={target.id}
                              className={`rc-dropdown-item ${isSelected ? "active" : ""}`}
                              onClick={() => loadTargetQR(target.id)}
                            >
                              <div className="rc-dropdown-item-info">
                                <div className="rc-mall-thumb">
                                  {target.image ? (
                                    <img src={target.image} alt={target.name} />
                                  ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <div className="rc-item-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>{target.name}</span>
                                    {target.type === "shop" && (
                                      <span
                                        style={{
                                          fontSize: "10px",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          background: "var(--rc-blue-50)",
                                          color: "var(--rc-blue-600)",
                                          fontWeight: 700,
                                        }}
                                      >
                                        STORE
                                      </span>
                                    )}
                                  </div>
                                  <div className="rc-item-subtitle">{target.category}</div>
                                </div>
                              </div>
                              {isSelected && <span className="rc-item-check">✓</span>}
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                          No stores or malls matching "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Destination URL (Starts from Welcome Page) */}
            <div className="rc-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="rc-label" style={{ margin: 0 }}>
                  QR Destination URL (Welcome Pass Page) *
                </label>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--rc-blue-600)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset Default
                </button>
              </div>

              <div className="rc-link-input-row">
                <input
                  type="text"
                  className="rc-input"
                  placeholder="https://yourdomain.com/:id"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setIsSaved(false);
                  }}
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
                <button
                  type="button"
                  className="rc-icon-button"
                  onClick={handleCopyLink}
                  title="Copy link to clipboard"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rc-icon-button"
                  title="Test welcome pass link in new tab"
                  style={{ textDecoration: "none" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Test ↗
                </a>
              </div>
            </div>

            {/* Dimensions Slider */}
            <div className="rc-form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label className="rc-label" style={{ margin: 0 }}>
                  QR Code Resolution
                </label>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8" }}>
                  {size} × {size} px
                </span>
              </div>
              <input
                type="range"
                min="160"
                max="360"
                step="10"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setIsSaved(false);
                }}
                style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
              />
            </div>

            {/* Save to Database & Feedback Section */}
            <div className="rc-save-actions">
              {saveSuccessMsg && (
                <div className="rc-alert-bubble rc-alert-success-bubble">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="rc-alert-bubble rc-alert-error-bubble">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Button
                  variant="primary"
                  onClick={handleSaveToDb}
                  disabled={isSaving}
                  style={{ width: "100%" }}
                  icon={
                    !isSaving ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    ) : null
                  }
                >
                  {isSaving ? "Saving..." : "Save to DB"}
                </Button>

                <Button
                  variant="outline"
                  onClick={downloadQR}
                  style={{ width: "100%" }}
                  icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  }
                >
                  Download PNG
                </Button>
              </div>
            </div>
          </div>

          {/* Right Live Preview Panel */}
          <div className="rc-qr-preview-panel">
            <div className="rc-preview-heading">
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "inline-block",
                }}
              ></span>
              Live Scan Preview
            </div>

            <div ref={qrRef} className="rc-qr-canvas-frame">
              <QRCodeCanvas
                value={text || `${BASE_QR_URL}/${selectedTargetId || "welcome"}`}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="rc-preview-mall-title">
              {selectedTarget?.name || "Red Carpet VIP"}
            </div>

            <div style={{ fontSize: "12px", color: "var(--rc-blue-600)", fontWeight: 600, marginTop: "2px" }}>
              {selectedTarget?.category || "VIP Queue Pass"}
            </div>

            <div className="rc-preview-badge" style={{ marginTop: "12px" }}>
              <span>●</span>
              Strict B&amp;W High-Contrast Print Quality
            </div>

            <span style={{ fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
              Ready for counter stands &amp; smartphone scanning
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRGenerator;