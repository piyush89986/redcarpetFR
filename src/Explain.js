import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/common";
import API_BASE from "./apiConfig";
import "./components/common/common.css";
import "./Explain.css";

function Explain() {
  const { id } = useParams();
  const [mall, setMall] = useState(null);

  useEffect(() => {
    if (!id) return;
    const apiBase = API_BASE;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => setMall(res.data))
      .catch((err) => console.log("Mall fetch notice:", err.message));
  }, [id]);

  return (
    <div className="explain-page">
      <div className="explain-card">
        <div className="explain-badge">
          Red Carpet Concierge
        </div>

        <h1 className="explain-title">
          {mall?.title ? `Welcome to ${mall.title}` : "Welcome to Red Carpet VIP"}
        </h1>
        {mall?.mallTitle && (
          <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--rc-blue-700)", marginTop: "-4px", marginBottom: "12px" }}>
            📍 {mall.mallTitle} Counter
          </p>
        )}

        <p className="explain-text">
          Enjoy an exclusive shopping journey designed for our privileged guests.
          Skip the long billing counters with our smart digital queue pass and dedicated concierge cart.
        </p>

        <div className="explain-features">
          <div className="explain-feature">
            <span className="explain-feature-icon">🛒</span>
            <span>Priority Cart</span>
          </div>
          <div className="explain-feature">
            <span className="explain-feature-icon">⚡</span>
            <span>Zero Waiting</span>
          </div>
          <div className="explain-feature">
            <span className="explain-feature-icon">📲</span>
            <span>SMS Queue Track</span>
          </div>
        </div>

        {mall?.subscriptionStatus === "inactive" ? (
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              ⚠️ Platform Subscription Notice: Service for this location is currently paused by platform administration.
            </div>
            <Button variant="outline" size="lg" disabled style={{ width: "100%", opacity: 0.6 }}>
              Pass Currently Unavailable
            </Button>
          </div>
        ) : (
          <Link to={`/${id}/information`} style={{ width: "100%", textDecoration: "none" }}>
            <Button
              variant="primary"
              size="lg"
              style={{ width: "100%" }}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              }
            >
              Get VIP Pass &amp; Cart
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Explain;
