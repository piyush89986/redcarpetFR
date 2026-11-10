import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Home,
  QrCode,
  BarChart3,
  Store,
  BookOpen,
  LogOut
} from "lucide-react";

const DockSidebar = React.memo(({
  isCollapsed: propIsCollapsed = false,
  onToggleCollapse,
  activeItem = "home",
  onNavigateHome,
  onNavigateQrStudio,
  onNavigateAnalytics,
  onNavigateStoreDirectors,
  onCloudClick,
  onHelpClick,
  onProfileClick,
  onSignOut,
  user = null
}) => {
  const [imgError, setImgError] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = onToggleCollapse ? propIsCollapsed : internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  const storedUser = useMemo(() => {
    if (user) return user;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, [user]);

  const storedRole = useMemo(() => {
    return (localStorage.getItem("role") || "admin").toLowerCase().trim();
  }, []);

  const isShopUser = useMemo(() => {
    return (
      storedRole === "shop admin" ||
      storedRole === "shopadmin" ||
      storedRole === "shop" ||
      storedRole.includes("shop")
    );
  }, [storedRole]);

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("shopId");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  const avatarImage = storedUser?.image || storedUser?.avatar || null;

  const initials = useMemo(() => {
    if (storedUser?.name) {
      return storedUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (storedRole === "superadmin") return "SA";
    if (storedRole === "admin") return "AD";
    return "ST";
  }, [storedUser, storedRole]);

  // Tooltip Wrapper Helper
  const renderDockButton = (key, icon, label, onClick, isActive, isDanger = false) => {
    return (
      <div key={key} className="relative group flex items-center justify-center">
        <button
          type="button"
          onClick={onClick}
          className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
            isActive
              ? "bg-[#27282d] text-[#e5fc73] shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
              : isDanger
              ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {icon}
        </button>

        {/* Floating Tooltip Label */}
        <div className="hidden md:flex pointer-events-none absolute left-[56px] items-center opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-[9999]">
          <div className="bg-[#1c1d22] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl border border-white/10 flex items-center gap-1.5">
            <span>{label}</span>
          </div>
        </div>
      </div>
    );
  };

  // --- SHOP STAFF SIDEBAR (Store Counter Operators) ---
  if (isShopUser) {
    return (
      <aside
        className="bg-[#151618] rounded-[22px] md:rounded-[36px] p-2 md:py-4 md:px-1.5 flex md:flex-col justify-between items-center shadow-2xl transition-all duration-300 ease-in-out z-40 fixed left-2 sm:left-3 md:left-3.5 top-3 sm:top-4 md:top-5 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] md:w-[62px] md:h-[calc(100vh-40px)] max-h-[calc(100vh-40px)]"
      >
        {/* Top: Home / Counter Queue */}
        <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full justify-around md:justify-start">
          {renderDockButton(
            "home",
            <Home size={18} />,
            "Counter Queue",
            onNavigateHome,
            activeItem === "home" || activeItem === "counter"
          )}
        </div>

        {/* Bottom: Help, Profile & Sign Out */}
        <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full justify-around md:justify-end">
          {renderDockButton(
            "help",
            <BookOpen size={18} />,
            "Help & Guidelines",
            onHelpClick,
            false
          )}

          {/* Profile & Settings Button */}
          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={onProfileClick}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#30333a] hover:border-[#e5fc73] overflow-hidden transition-all duration-200 hover:scale-105 cursor-pointer bg-[#24252a] shrink-0 flex items-center justify-center"
            >
              {avatarImage && !imgError ? (
                <img
                  src={avatarImage}
                  alt="Store Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-[#e5fc73] font-black text-xs uppercase select-none tracking-tight">
                  {initials}
                </span>
              )}
            </button>

            <div className="hidden md:flex pointer-events-none absolute left-[56px] items-center opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-[9999]">
              <div className="bg-[#1c1d22] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl border border-white/10">
                <span>Profile &amp; Settings</span>
              </div>
            </div>
          </div>

          {renderDockButton(
            "signout",
            <LogOut size={18} />,
            "Sign Out",
            handleSignOut,
            false,
            true
          )}
        </div>
      </aside>
    );
  }

  // --- MALL / BUSINESS ADMIN SIDEBAR ---
  return (
    <aside
      className={`bg-[#151618] rounded-[22px] md:rounded-[36px] p-2 md:py-3.5 md:px-1.5 flex md:flex-col justify-between items-center shadow-2xl transition-all duration-300 ease-in-out z-40 fixed left-2 sm:left-3 md:left-3.5 top-3 sm:top-4 md:top-5 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] md:w-[62px] ${
        isCollapsed
          ? "h-[54px] md:h-[105px] overflow-hidden"
          : "h-auto md:h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] overflow-hidden"
      }`}
    >
      {/* Top Group: Collapse Toggle Arrow & Main Nav Icons */}
      <div className="flex md:flex-col items-center gap-2 md:gap-2.5 w-full justify-around md:justify-start">
        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          title={isCollapsed ? "Expand Dock" : "Collapse Dock"}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#e5fc73] hover:text-[#111] text-gray-300 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 shrink-0"
        >
          {isCollapsed ? (
            <ChevronDown size={16} strokeWidth={2.8} />
          ) : (
            <ChevronUp size={16} strokeWidth={2.8} />
          )}
        </button>

        {/* Nav Items (visible when not collapsed) */}
        {!isCollapsed && (
          <>
            {renderDockButton(
              "stores",
              <Home size={18} />,
              "Brand Stores",
              onNavigateHome,
              activeItem === "home" || activeItem === "stores"
            )}

            {renderDockButton(
              "qr",
              <QrCode size={18} />,
              "QR Studio",
              onNavigateQrStudio,
              activeItem === "qr" || activeItem === "qrcode"
            )}

            {renderDockButton(
              "analytics",
              <BarChart3 size={18} />,
              "Reports & Analytics",
              () => {
                if (onNavigateAnalytics) {
                  onNavigateAnalytics();
                } else if (onCloudClick) {
                  onCloudClick();
                } else {
                  window.location.href = "/analytics";
                }
              },
              activeItem === "analytics" || activeItem === "statistics"
            )}

            {renderDockButton(
              "counters",
              <Store size={18} />,
              "Store Counters",
              onNavigateStoreDirectors || onNavigateHome,
              activeItem === "counters"
            )}
          </>
        )}
      </div>

      {/* Bottom Group: Help, Profile & Sign Out */}
      {!isCollapsed && (
        <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full justify-around md:justify-end">
          {renderDockButton(
            "help",
            <BookOpen size={18} />,
            "Help & Guidelines",
            onHelpClick,
            false
          )}

          {/* Admin Profile Button */}
          <div className="relative group flex items-center justify-center">
            <button
              type="button"
              onClick={onProfileClick}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#30333a] hover:border-[#e5fc73] overflow-hidden transition-all duration-200 hover:scale-105 cursor-pointer bg-[#24252a] shrink-0 flex items-center justify-center"
            >
              {avatarImage && !imgError ? (
                <img
                  src={avatarImage}
                  alt="Account Profile"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-[#e5fc73] font-black text-xs uppercase select-none tracking-tight">
                  {initials}
                </span>
              )}
            </button>

            <div className="hidden md:flex pointer-events-none absolute left-[56px] items-center opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-[9999]">
              <div className="bg-[#1c1d22] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-2xl border border-white/10">
                <span>Account Profile</span>
              </div>
            </div>
          </div>

          {renderDockButton(
            "signout",
            <LogOut size={18} />,
            "Sign Out",
            handleSignOut,
            false,
            true
          )}
        </div>
      )}
    </aside>
  );
});

export default DockSidebar;
