import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "./common";
import API_BASE from "../apiConfig";
import { useAppDispatch, setCredentials } from "../redux";
import "./common/common.css";

const AuthPage = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const shopId = localStorage.getItem("shopId");

    if (token) {
      const cleanRole = (role || "").toLowerCase().trim();
      if (cleanRole === "superadmin") {
        navigate("/ownerdashboard", { replace: true });
      } else if (cleanRole === "admin" && shopId) {
        navigate(`/branddashboard2/${shopId}`, { replace: true });
      } else if (
        (cleanRole === "shop admin" || cleanRole === "shopadmin" || cleanRole === "shop") &&
        shopId
      ) {
        navigate(`/${shopId}/counter`, { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (leftRef.current && rightRef.current) {
      gsap.fromTo(
        leftRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }
      );
      gsap.fromTo(
        rightRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.9, delay: 0.15, ease: "power3.out" }
      );
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const apiBase = API_BASE;
      const res = await axios.post(`${apiBase}/api/auth/login`, { email, password });

      const userRole = (res.data.role || res.data.user?.role || "admin").toLowerCase().trim();
      const userShopId = res.data.shopId || "";

      // Update Redux Store
      dispatch(
        setCredentials({
          token: res.data.token,
          role: userRole,
          shopId: userShopId,
          user: res.data.user || null,
        })
      );

      if (userRole === "superadmin") {
        navigate("/ownerdashboard");
      } else if (userRole === "admin") {
        navigate(`/branddashboard2/${userShopId}`);
      } else if (
        userRole === "shop admin" ||
        userRole === "shopadmin" ||
        userRole === "shop"
      ) {
        navigate(`/${userShopId}/counter`);
      } else {
        navigate(`/branddashboard2/${userShopId}`);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (eMail, pass) => {
    setEmail(eMail);
    setPassword(pass);
    setErrorMessage("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        background: "#ffffff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Left Brand Showcase Panel (Desktop) */}
      <div
        ref={leftRef}
        style={{
          flex: "1 1 50%",
          background: "linear-gradient(145deg, #090d16 0%, #0f172a 45%, #1e3a8a 100%)",
          color: "#ffffff",
          padding: "60px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
        className="rc-auth-showcase-panel"
      >
        {/* Ambient Glow Bubbles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Top Brand Tag */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "18px",
                color: "#ffffff",
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
              }}
            >
              RC
            </span>
            <span style={{ fontSize: "24px", fontWeight: 900, letterSpacing: "-0.5px", color: "#ffffff" }}>
              RedCarpet
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.8px",
                padding: "3px 8px",
                borderRadius: "9999px",
                background: "rgba(56,189,248,0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56,189,248,0.3)",
              }}
            >
              VIP CONCIERGE
            </span>
          </div>
        </div>

        {/* Center Presentation Copy */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: "520px", margin: "40px 0" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 900,
              lineHeight: "1.2",
              letterSpacing: "-0.8px",
              marginBottom: "16px",
              color: "#ffffff",
            }}
          >
            Elevate Customer Queue Times into Seamless Luxury Experiences.
          </h1>
          <p style={{ fontSize: "16px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "36px" }}>
            Real-time digital token tracking, automated Twilio RCS arrival messages, and unified multi-mall management for premier retail destinations.
          </p>

          {/* Feature Highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(37,99,235,0.2)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60a5fa",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <strong style={{ fontSize: "14px", color: "#f1f5f9", display: "block" }}>
                  Twilio RCS &amp; SMS Dispatch
                </strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Direct turn-arrival notices dispatched via customer mobile templates
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(37,99,235,0.2)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60a5fa",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <div>
                <strong style={{ fontSize: "14px", color: "#f1f5f9", display: "block" }}>
                  Individual Shop QR Passes
                </strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Each brand store maintains its own dedicated queue and QR pass studio
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "rgba(37,99,235,0.2)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60a5fa",
                  flexShrink: 0,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div>
                <strong style={{ fontSize: "14px", color: "#f1f5f9", display: "block" }}>
                  Live TV Countdown Billboard
                </strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Automated daily resets (#1 start) and fullscreen lobby displays
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div style={{ position: "relative", zIndex: 2, fontSize: "12px", color: "#64748b" }}>
          <span>🔒 256-Bit Encrypted Platform • Corporate Access Only</span>
        </div>
      </div>

      {/* Right Login Side (Cardless, Spacious Design) */}
      <div
        ref={rightRef}
        style={{
          flex: "1 1 50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 32px",
          background: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "var(--rc-blue-600)",
                display: "inline-block",
                marginBottom: "6px",
              }}
            >
              Portal Authentication
            </span>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 900,
                color: "var(--rc-text-main)",
                letterSpacing: "-0.5px",
                margin: "0 0 8px 0",
              }}
            >
              Sign In to RedCarpet
            </h2>
            <p style={{ margin: 0, color: "var(--rc-text-muted)", fontSize: "14px", lineHeight: "1.5" }}>
              Enter your verified manager or staff credentials to access your administrative workspace.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div
              style={{
                padding: "12px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "var(--rc-radius-md)",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form (Flat, Clean, Cardless) */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="rc-form-group">
              <label className="rc-label">Work Email Address</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ position: "absolute", left: "14px", color: "var(--rc-text-light)", pointerEvents: "none" }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="admin@redcarpet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rc-input"
                  style={{ paddingLeft: "42px" }}
                  required
                />
              </div>
            </div>

            <div className="rc-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="rc-label">Account Password</label>
                <button
                  type="button"
                  onClick={() => navigate("/forgotpassword")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--rc-blue-600)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ position: "absolute", left: "14px", color: "var(--rc-text-light)", pointerEvents: "none" }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rc-input"
                  style={{ paddingLeft: "42px" }}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              style={{ width: "100%", marginTop: "6px" }}
            >
              {loading ? "Authenticating..." : "Sign in to Dashboard"}
            </Button>
          </form>

          {/* Quick-Fill Credentials Helper (Easy Testing) */}
          <div
            style={{
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid var(--rc-border)",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.6px",
                color: "var(--rc-text-muted)",
                display: "block",
                marginBottom: "10px",
              }}
            >
              Quick Test Credentials:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button
                type="button"
                onClick={() => fillQuickCredentials("admin@redcarpet.com", "Admin@123")}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  background: "var(--rc-blue-50)",
                  border: "1px solid var(--rc-blue-200)",
                  color: "var(--rc-blue-700)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials("manager@phoenixmall.com", "Phoenix@123")}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  background: "#f8fafc",
                  border: "1px solid var(--rc-border)",
                  color: "var(--rc-text-body)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🏬 Mall Manager
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials("zara@phoenixmall.com", "Zara@123")}
                style={{
                  padding: "5px 10px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  background: "#f8fafc",
                  border: "1px solid var(--rc-border)",
                  color: "var(--rc-text-body)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🎟️ Shop Counter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
