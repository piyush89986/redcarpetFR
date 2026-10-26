import React from "react";
import "./common.css";

const Button = ({
  children,
  onClick,
  variant = "primary", // primary, outline, secondary, ghost, danger
  size = "md", // sm, md, lg
  type = "button",
  disabled = false,
  icon = null,
  title = "",
  className = "",
  ...props
}) => {
  const variantClass = `rc-btn-${variant}`;
  const sizeClass = size !== "md" ? `rc-btn-${size}` : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rc-btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="rc-btn-icon">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
