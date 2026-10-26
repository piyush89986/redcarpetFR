import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "./Button";
import "./common.css";

const Navbar = ({
  brandBadge = "",
  search = null,
  onSearchChange = null,
  searchPlaceholder = "Search...",
  actions = null,
  showNavLinks = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("shopId");
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  const navItems = [
    { label: "Malls", path: "/ownerdashboard" },
    { label: "Showcase", path: "/branddashboard" },
    { label: "QR Studio", path: "/qrcode" },
  ];

  return (
    <header className="rc-navbar">
      {/* Brand Header */}
      <div className="rc-brand" onClick={() => navigate("/ownerdashboard")}>
        <span className="rc-brand-title">RedCarpet</span>
        {brandBadge && <span className="rc-brand-badge">{brandBadge}</span>}
      </div>

      {/* Navigation Quick Links */}
      {showNavLinks && (
        <nav className="rc-nav-links">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={`rc-nav-link ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}

      {/* Search Bar (if enabled) */}
      {onSearchChange !== null && (
        <div className="rc-nav-search">
          <svg
            className="rc-nav-search-icon"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="rc-search-input"
            placeholder={searchPlaceholder}
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              className="rc-search-clear"
              onClick={() => onSearchChange("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Action Controls & Logout */}
      <div className="rc-nav-actions">
        {actions}

        <Button
          variant="danger"
          size="sm"
          onClick={handleLogout}
          title="Sign out of your session"
          icon={
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          }
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
