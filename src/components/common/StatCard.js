import React from "react";
import "./common.css";

const StatCard = ({ icon, label, value, sub }) => {
  return (
    <div className="rc-stat-card">
      {icon && <div className="rc-stat-icon-wrap">{icon}</div>}
      <div className="rc-stat-info">
        <span className="rc-stat-label">{label}</span>
        <span className="rc-stat-val">{value}</span>
        {sub && <span className="rc-stat-sub">{sub}</span>}
      </div>
    </div>
  );
};

export default StatCard;
