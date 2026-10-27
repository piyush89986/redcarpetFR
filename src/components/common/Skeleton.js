import React from "react";
import "./common.css";

// Generic Shimmer Box
export const Skeleton = ({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  style = {},
  className = "",
}) => {
  return (
    <div
      className={`rc-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

// Skeleton Card for Malls (OwnerDashboard)
export const SkeletonMallCard = () => {
  return (
    <article className="rc-card rc-skeleton-card">
      <div className="rc-card-media" style={{ height: "190px" }}>
        <Skeleton width="100%" height="100%" borderRadius="0" />
      </div>
      <div className="rc-card-body">
        <Skeleton width="70%" height="24px" style={{ marginBottom: "12px" }} />
        <Skeleton width="90%" height="14px" style={{ marginBottom: "8px" }} />
        <Skeleton width="60%" height="14px" style={{ marginBottom: "16px" }} />

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <Skeleton width="45%" height="16px" />
          <Skeleton width="45%" height="16px" />
        </div>

        {/* Switch placeholder */}
        <Skeleton width="100%" height="40px" borderRadius="10px" style={{ marginBottom: "12px" }} />

        {/* Action Buttons placeholder */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <Skeleton width="100%" height="34px" borderRadius="8px" />
          <Skeleton width="calc(50% - 4px)" height="34px" borderRadius="8px" />
          <Skeleton width="calc(50% - 4px)" height="34px" borderRadius="8px" />
        </div>
      </div>
    </article>
  );
};

// Skeleton Grid for Malls
export const SkeletonMallGrid = ({ count = 6 }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMallCard key={i} />
      ))}
    </div>
  );
};

// Skeleton Card for Brands & Shops (BrandDashboard2 / ShopDetail)
export const SkeletonBrandCard = () => {
  return (
    <article className="rc-card-clean rc-skeleton-card">
      <div className="rc-card-clean-header" style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
        <Skeleton width="56px" height="56px" borderRadius="14px" />
        <div style={{ flex: 1 }}>
          <Skeleton width="65%" height="20px" style={{ marginBottom: "8px" }} />
          <Skeleton width="45%" height="13px" />
        </div>
      </div>

      <Skeleton width="95%" height="14px" style={{ marginBottom: "6px" }} />
      <Skeleton width="80%" height="14px" style={{ marginBottom: "16px" }} />

      <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
        <Skeleton width="50%" height="16px" />
        <Skeleton width="40%" height="16px" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <Skeleton width="100%" height="34px" borderRadius="8px" />
        <Skeleton width="100%" height="34px" borderRadius="8px" />
        <Skeleton width="100%" height="34px" borderRadius="8px" />
        <Skeleton width="100%" height="34px" borderRadius="8px" />
      </div>
    </article>
  );
};

// Skeleton Grid for Brands
export const SkeletonBrandGrid = ({ count = 6 }) => {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBrandCard key={i} />
      ))}
    </div>
  );
};

// Skeleton Table for Queue (Counter.js)
export const SkeletonQueueTable = ({ rows = 5 }) => {
  return (
    <div className="rc-table-container">
      <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
        <Skeleton width="30%" height="18px" />
      </div>
      <div style={{ padding: "12px 16px" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1.5fr 1fr 1fr 120px",
              gap: "16px",
              alignItems: "center",
              padding: "16px 0",
              borderBottom: i === rows - 1 ? "none" : "1px solid #f1f5f9",
            }}
          >
            <Skeleton width="50px" height="30px" borderRadius="8px" />
            <Skeleton width="75%" height="18px" />
            <Skeleton width="60%" height="16px" />
            <Skeleton width="80px" height="24px" borderRadius="20px" />
            <Skeleton width="90px" height="34px" borderRadius="8px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
