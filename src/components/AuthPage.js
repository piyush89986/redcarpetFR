import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const shopId = localStorage.getItem("shopId");

    if (token) {
      const cleanRole = (role || "").toLowerCase().trim();
      if (cleanRole === "superadmin") {
        navigate("/branddashboard");
      } else if (cleanRole === "admin" && shopId) {
        navigate(`/branddashboard2/${shopId}`);
      } else if (
        (cleanRole === "shop admin" || cleanRole === "shopadmin" || cleanRole === "shop") &&
        shopId
      ) {
        navigate(`/${shopId}/counter`);
      }
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(
      formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
    );
  }, [isSignup]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiBase = API_BASE;
      const url = isSignup
        ? `${apiBase}/api/auth/signup`
        : `${apiBase}/api/auth/login`;
      const data = isSignup
        ? { name, email, password, role: "admin" }
        : { email, password };

      const res = await axios.post(url, data);

      if (!isSignup) {
        const userRole = (res.data.role || res.data.user?.role || "admin").toLowerCase().trim();
        const userShopId = res.data.shopId || "";

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", userRole);
        localStorage.setItem("shopId", userShopId);

        if (userRole === "superadmin") {
          navigate("/branddashboard");
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
      } else {
        alert("Account registered successfully! Please log in.");
        setIsSignup(false);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f8fafc 0%, #f0f7ff 100%)",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        ref={formRef}
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--rc-white)",
          border: "1px solid var(--rc-border-blue)",
          borderRadius: "var(--rc-radius-xl)",
          padding: "40px 32px",
          boxShadow: "var(--rc-shadow-lg)",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Logo & Header */}
        <div ref={titleRef} style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "var(--rc-blue-50)",
              border: "1px solid var(--rc-blue-200)",
              color: "var(--rc-blue-700)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "12px",
            }}
          >
            RedCarpet Platform
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 900,
              color: "var(--rc-blue-700)",
              margin: "0 0 6px 0",
              letterSpacing: "-0.5px",
            }}
          >
            {isSignup ? "Create Mall Account" : "Sign in to Dashboard"}
          </h1>
          <p style={{ margin: 0, color: "var(--rc-text-muted)", fontSize: "14px" }}>
            {isSignup
              ? "Register to manage complexes and brand counters"
              : "Enter your verified credentials to continue"}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isSignup && (
            <div className="rc-form-group">
              <label className="rc-label">Full Name *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rc-input"
                required
              />
            </div>
          )}

          <div className="rc-form-group">
            <label className="rc-label">Email Address *</label>
            <input
              type="email"
              placeholder="admin@redcarpet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rc-input"
              required
            />
          </div>

          <div className="rc-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="rc-label">Password *</label>
              {!isSignup && (
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
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rc-input"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px" }}
          >
            {loading ? "Authenticating..." : isSignup ? "Create Account" : "Sign In"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--rc-border)" }}>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--rc-text-muted)" }}>
            {isSignup ? "Already have an account?" : "Need a new manager account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              style={{
                background: "none",
                border: "none",
                color: "var(--rc-blue-600)",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                fontSize: "14px",
              }}
            >
              {isSignup ? "Sign In" : "Register here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
