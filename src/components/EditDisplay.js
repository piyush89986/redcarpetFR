import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar, Button } from "./common";
import "./common/common.css";

function EditDisplay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [backgroundImage, setBackgroundImage] = useState("");
  const [phoenixText, setPhoenixText] = useState("");
  const [pText, setPText] = useState("");
  const [royalPassText, setRoyalPassText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    axios
      .get(`${apiBase}/api/display/${id}`)
      .then((res) => {
        const data = res.data || {};
        if (data && (data.backgroundImage || data.phoenixText)) {
          setIsEditing(true);
        }
        setBackgroundImage(data.backgroundImage || "");
        setPhoenixText(data.phoenixText || "");
        setPText(data.pText || "");
        setRoyalPassText(data.royalPassText || "");
      })
      .catch((error) => console.error("Error fetching display data:", error));
  }, [id, apiBase]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataPayload = {
        backgroundImage,
        phoenixText,
        pText,
        royalPassText,
        displayid: id,
      };

      if (isEditing) {
        await axios.put(`${apiBase}/api/display/${id}`, dataPayload);
        alert("Billboard Display configuration updated successfully!");
      } else {
        await axios.post(`${apiBase}/api/display`, dataPayload);
        alert("Billboard Display created successfully!");
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error saving display:", error);
      alert("Failed to save billboard display settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 800;
          const maxHeight = 800;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setBackgroundImage(compressedBase64);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="rc-page-container">
      {/* Reusable Navbar */}
      <Navbar
        brandBadge="Billboard Studio"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/shop/${id}`)}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              }
            >
              Shop Settings
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open("/display", "_blank")}
            >
              Open Full Billboard
            </Button>
          </>
        }
      />

      <main className="rc-main-content">
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div className="rc-section-header">
            <div>
              <h2 className="rc-section-title">Configure TV & LED Billboard Display</h2>
              <p className="rc-section-desc">
                Customize the high-impact marquee banner and VIP pass slogans shown across mall TV screens.
              </p>
            </div>
          </div>

          <div
            style={{
              background: "var(--rc-white)",
              border: "1px solid var(--rc-border)",
              borderRadius: "var(--rc-radius-xl)",
              padding: "36px",
              boxShadow: "var(--rc-shadow-md)",
            }}
          >
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="rc-form-group">
                <label className="rc-label">Marquee Sliding Text *</label>
                <input
                  type="text"
                  className="rc-input"
                  placeholder="e.g. PHOENIX MARKETCITY"
                  value={phoenixText}
                  onChange={(e) => setPhoenixText(e.target.value)}
                  required
                />
                <span style={{ fontSize: "12px", color: "var(--rc-text-muted)" }}>
                  Continuous scrolling text displayed in large animated letters.
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
                <div className="rc-form-group">
                  <label className="rc-label">Badge Initial / Symbol</label>
                  <input
                    type="text"
                    className="rc-input"
                    placeholder="e.g. P"
                    value={pText}
                    onChange={(e) => setPText(e.target.value)}
                  />
                </div>

                <div className="rc-form-group">
                  <label className="rc-label">Pass Slogan / Tagline</label>
                  <input
                    type="text"
                    className="rc-input"
                    placeholder="e.g. RED CARPET PASS"
                    value={royalPassText}
                    onChange={(e) => setRoyalPassText(e.target.value)}
                  />
                </div>
              </div>

              <div className="rc-form-group">
                <label className="rc-label">Billboard Background Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    padding: "10px",
                    border: "1px dashed var(--rc-border-blue)",
                    borderRadius: "var(--rc-radius-md)",
                    background: "var(--rc-blue-50)",
                    cursor: "pointer",
                  }}
                />
                {backgroundImage && (
                  <div style={{ marginTop: "12px" }}>
                    <span style={{ fontSize: "12px", color: "var(--rc-text-muted)", display: "block", marginBottom: "6px" }}>
                      Current Background Preview:
                    </span>
                    <img
                      src={backgroundImage}
                      alt="Banner Preview"
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "var(--rc-radius-md)",
                        border: "1px solid var(--rc-border-blue)",
                      }}
                    />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : isEditing ? "Update Billboard" : "Publish Billboard"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditDisplay;
