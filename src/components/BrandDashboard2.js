import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Navbar, Button, StatCard } from "./common";
import "./common/common.css";

const BrandDashboard2 = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/api/shops/${id}`)
      .then((res) => setShop(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const filteredMenuItems = shop?.menuItems?.filter((menuItem) =>
    menuItem.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menuItem.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
              onClick={() => navigate("/branddashboard")}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              }
            >
              Back to Malls
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
              Live Counter
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
            label="Queue Status"
            value="Active"
            sub="Real-time dispatch ready"
          />
        </section>

        {/* Section Heading */}
        <div className="rc-section-header">
          <div>
            <h2 className="rc-section-title">Brand Directory & Store Passes</h2>
            <p className="rc-section-desc">
              Browse stores inside {shop?.title || "this mall"} and get fast queue tokens.
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

                  <div className="rc-card-actions">
                    {item.link ? (
                      <a
                        href={`/?callbackUrl=${item._id}`}
                        onClick={() => localStorage.removeItem("token")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rc-btn rc-btn-primary rc-btn-sm"
                        style={{ flex: 1 }}
                      >
                        Visit Store
                      </a>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/${id}/counter`)}
                      >
                        Queue Counter
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/${id}/counter`)}
                      title="View live queue"
                    >
                      Counter
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

export default BrandDashboard2;
