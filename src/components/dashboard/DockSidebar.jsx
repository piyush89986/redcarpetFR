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
  isCollapsed = false,
  onToggleCollapse,
  onAddMall,
  activeItem = "home",
  onNavigateHome,
  onNavigateQrStudio,
  onNavigateAnalytics,
  onNavigateStoreDirectors,
  onCloudClick,
  onGlobalClick,
  onHelpClick,
  onAudioAlertClick,
  onProfileClick,
  onSignOut,
  user = null
}) => {
  const [imgError, setImgError] = useState(false);

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
    if (storedRole === "admin") return "AD";
    return "ST";
  }, [storedUser, storedRole]);

  // For Shop Users: Show strictly Home, Help, and Sign Out only
  if (isShopUser) {
    return (
      <aside
        className="bg-[#151618] rounded-[22px] md:rounded-[36px] p-2 md:py-4 md:px-1.5 flex md:flex-col justify-between items-center shadow-2xl transition-all duration-300 ease-in-out z-40 fixed left-2 sm:left-3 md:left-3.5 top-3 sm:top-4 md:top-5 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] md:w-[62px] md:h-[calc(100vh-40px)] max-h-[calc(100vh-40px)]"
      >
        {/* Top: Home Page Button */}
        <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full justify-around md:justify-start">
          <button
            type="button"
            onClick={onNavigateHome}
            title="Home Page / Counter Queue"
            className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
              activeItem === "home" || activeItem === "counter"
                ? "bg-[#27282d] text-white shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home size={18} />
          </button>
        </div>

        {/* Bottom: Help & Sign Out Buttons */}
        <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full justify-around md:justify-end">
          <button
            type="button"
            onClick={onHelpClick}
            title="Help & Guides"
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer shrink-0"
          >
            <BookOpen size={18} />
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer shrink-0"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`bg-[#151618] rounded-[22px] md:rounded-[36px] p-2 md:py-3.5 md:px-1.5 flex md:flex-col justify-between items-center shadow-2xl transition-all duration-300 ease-in-out z-40 fixed left-2 sm:left-3 md:left-3.5 top-3 sm:top-4 md:top-5 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] md:w-[62px] ${
        isCollapsed
          ? "h-[54px] md:h-[105px] overflow-hidden"
          : "h-auto md:h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] overflow-hidden"
      }`}
    >
      {/* Top Group: Collapse Toggle Arrow, Main Nav Icons */}
      <div className="flex md:flex-col items-center gap-2 md:gap-2.5 w-full justify-around md:justify-start">
        {/* ^ Smooth Collapse / Expand Arrow Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
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
            <button
              type="button"
              onClick={onNavigateHome}
              title="Overview & Brand Dashboard"
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                activeItem === "home" || activeItem === "stores"
                  ? "bg-[#27282d] text-white shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home size={18} />
            </button>

            <button
              type="button"
              onClick={onNavigateQrStudio}
              title="QR Studio"
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                activeItem === "qr" || activeItem === "qrcode"
                  ? "bg-[#27282d] text-white shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <QrCode size={18} />
            </button>

            {/* Business Statistics & Footfall Analytics — Accessible to Admin */}
            <button
              type="button"
              onClick={() => {
                if (onNavigateAnalytics) {
                  onNavigateAnalytics();
                } else if (onCloudClick) {
                  onCloudClick();
                } else {
                  window.location.href = "/analytics";
                }
              }}
              title="Business Statistics & Analytics"
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                activeItem === "analytics" || activeItem === "statistics"
                  ? "bg-[#27282d] text-[#e5fc73] shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <BarChart3 size={18} />
            </button>

            <button
              type="button"
              onClick={onNavigateStoreDirectors}
              title="Store Directors"
              className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ${
                activeItem === "stores"
                  ? "bg-[#27282d] text-white shadow-inner"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Store size={18} />
            </button>
          </>
        )}
      </div>

      {/* Bottom Group: Quick Help, Audio, Profile */}
      {!isCollapsed && (
        <div className="flex md:flex-col items-center gap-2 md:gap-3 w-full justify-around md:justify-end">
          <button
            type="button"
            onClick={onHelpClick}
            title="Help & Guides"
            className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer shrink-0"
          >
            <BookOpen size={18} />
          </button>

          {/* Profile Avatar Button: Shows real image if available, else clean monogram avatar */}
          <button
            type="button"
            onClick={onProfileClick}
            title={storedRole === "admin" ? "Business Admin Profile" : "Account Profile"}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#30333a] hover:border-[#e5fc73] overflow-hidden transition-all duration-200 hover:scale-105 cursor-pointer bg-[#24252a] shrink-0 flex items-center justify-center"
          >
            {avatarImage && !imgError ? (
              <img
                src={avatarImage}
                alt="Account"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-[#e5fc73] font-black text-xs uppercase select-none tracking-tight">
                {initials}
              </span>
            )}
          </button>
        </div>
      )}
    </aside>
  );
});

export default DockSidebar;
