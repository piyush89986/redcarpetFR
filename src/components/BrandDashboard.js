import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Navbar, Button, StatCard } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const BrandDashboard = () => {
  const [shops, setFoods] = useState([]);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const apiBase = API_BASE;
    setIsLoading(true);
    axios
      .get(`${apiBase}/api/shops`)
      .then((res) => setFoods(res.data || []))
      .catch((err) => console.error("Error fetching shops:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const role = localStorage.getItem("role");
  useEffect(() => {
    if (role && role !== "superadmin") {
      navigate("/");
    }
  }, [role, navigate]);

  const filteredShops = shops.filter((shop) => {
    return (
      shop.title?.toLowerCase().includes(search.toLowerCase()) ||
      shop.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="rc-page-container">
      {/* Reusable White & Blue Navbar */}
      <Navbar
        brandBadge="Showcase"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search malls or locations..."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/ownerdashboard")}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            }
          >
            Admin Dashboard
          </Button>
        }
      />

      <main className="rc-main-content">
        {/* KPI Stats in White & Blue */}
        <section className="rc-stats-grid">
          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3l3-2 3 2" />
              </svg>
            }
            label="Total Showcase Malls"
            value={shops.length}
            sub="Available complexes"
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
            label="Filtered Results"
            value={filteredShops.length}
            sub={search ? `Matching "${search}"` : "All complexes"}
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            }
            label="Directory Mode"
            value="Public Live"
            sub="Fast brand discovery"
          />
        </section>

        {/* Section Heading */}
        <div className="rc-section-header">
          <div>
            <h2 className="rc-section-title">Select Your Mall Complex</h2>
            <p className="rc-section-desc">
              Browse any mall destination to view brand stores, counters, and real-time queues.
            </p>
          </div>
        </div>

        {/* Mall Cards Showcase */}
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--rc-blue-600)" }}>
            <p style={{ fontWeight: 600 }}>Loading mall directory...</p>
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
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>No Malls Found</h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px" }}>
              {search
                ? `No malls match "${search}". Try another search term.`
                : "No malls available in directory."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
            {filteredShops.map((shop) => (
              <article key={shop._id} className="rc-card">
                <div className="rc-card-media">
                  <img
                    src={
                      shop.image ||
                      "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80"
                    }
                    alt={shop.title || "Mall"}
                    className="rc-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div className="rc-card-badge">
                    {shop.menuItems?.length || 0} Brands
                  </div>
                </div>

                <div className="rc-card-body">
                  <h3 className="rc-card-title">{shop.title || "Mall Destination"}</h3>
                  <p className="rc-card-desc">
                    {shop.description || "Explore curated shopping brands, restaurants, and queue counters."}
                  </p>

                  <div className="rc-card-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ flex: 1 }}
                      onClick={() => navigate(`/branddashboard2/${shop._id}`)}
                      icon={
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      }
                    >
                      Explore Brands
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/shop/${shop._id}`)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandDashboard;
