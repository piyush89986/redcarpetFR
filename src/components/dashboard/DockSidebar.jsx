import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
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
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem("adminSidebarExpanded") === "true";
  });

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

  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem("adminSidebarExpanded", String(next));
      if (onToggleCollapse) onToggleCollapse(next);
      return next;
    });
  };

  // --- SHOP STAFF SIDEBAR (Counter operators & Store Owners) ---
  if (isShopUser) {
    return (
      <aside
        className={`bg-[#151618] rounded-[22px] md:rounded-[32px] p-2 md:py-4 md:px-2 flex md:flex-col justify-between items-center shadow-2xl transition-all duration-300 ease-in-out z-40 fixed left-2 sm:left-3 md:left-3.5 top-3 sm:top-4 md:top-5 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] md:h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] ${
          isExpanded ? "md:w-[210px]" : "md:w-[62px]"
        }`}
      >
        {/* Top: Toggle and Home/Counter Queue */}
        <div className="flex md:flex-col items-center gap-2 md:gap-2.5 w-full justify-around md:justify-start">
          {/* Toggle Expand / Collapse */}
          <div className="relative group flex items-center w-full mb-1">
            <button
              type="button"
              onClick={handleToggleExpand}
              className={`w-8 h-8 md:w-full rounded-xl bg-white/10 hover:bg-[#e5fc73] hover:text-[#111] text-gray-300 flex items-center transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
                isExpanded ? "justify-between px-3 h-9" : "justify-center"
              }`}
            >
              {isExpanded ? (
                <>
                  <span className="text-[11px] font-bold uppercase tracking-wider">Collapse Menu</span>
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </>
              ) : (
                <ChevronRight size={16} strokeWidth={2.5} />
              )}
            </button>
            {!isExpanded && (
              <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5fc73]" />
                <span>Expand Sidebar</span>
              </div>
            )}
          </div>

          {/* Home / Counter Queue */}
          <div className="relative group flex items-center w-full">
            <button
              type="button"
              onClick={onNavigateHome}
              className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer ${
                isExpanded ? "px-3 gap-3 justify-start" : "justify-center"
              } ${
                activeItem === "home" || activeItem === "counter"
                  ? "bg-[#27282d] text-white shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Home size={18} className="shrink-0" />
              {isExpanded && <span className="text-xs font-bold truncate">Counter Queue</span>}
            </button>
            {!isExpanded && (
              <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5fc73]" />
                <span>Counter Queue</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Group: Help, Profile & Settings, Sign Out */}
        <div className="flex md:flex-col items-center gap-2 md:gap-2 w-full justify-around md:justify-end">
          {/* Help & Guides */}
          <div className="relative group flex items-center w-full">
            <button
              type="button"
              onClick={onHelpClick}
              className={`w-full h-10 rounded-xl flex items-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer shrink-0 ${
                isExpanded ? "px-3 gap-3 justify-start" : "justify-center"
              }`}
            >
              <BookOpen size={18} className="shrink-0" />
              {isExpanded && <span className="text-xs font-bold truncate">Help &amp; Guides</span>}
            </button>
            {!isExpanded && (
              <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Help &amp; Guides</span>
              </div>
            )}
          </div>

          {/* Profile & Settings Button for Store Owner */}
          <div className="relative group flex items-center w-full">
            <button
              type="button"
              onClick={onProfileClick}
              className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer shrink-0 ${
                isExpanded ? "px-2.5 gap-2.5 justify-start bg-white/5 hover:bg-white/10" : "justify-center"
              }`}
            >
              <div className="w-8 h-8 rounded-full border-2 border-[#30333a] overflow-hidden bg-[#24252a] shrink-0 flex items-center justify-center">
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
              </div>
              {isExpanded && (
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-white truncate leading-none">
                    {storedUser?.name || "Store Owner"}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-1">Profile &amp; Settings</div>
                </div>
              )}
            </button>
            {!isExpanded && (
              <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Profile &amp; Settings</span>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <div className="relative group flex items-center w-full">
            <button
              type="button"
              onClick={handleSignOut}
              className={`w-full h-10 rounded-xl flex items-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer shrink-0 ${
                isExpanded ? "px-3 gap-3 justify-start" : "justify-center"
              }`}
            >
              <LogOut size={18} className="shrink-0" />
              {isExpanded && <span className="text-xs font-bold truncate text-red-400">Sign Out</span>}
            </button>
            {!isExpanded && (
              <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Sign Out</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // --- ADMIN FULL DOCK SIDEBAR ---
  const navItems = [
    {
      id: "home",
      label: "Brand Stores",
      icon: Home,
      isActive: activeItem === "home" || activeItem === "stores",
      onClick: onNavigateHome,
    },
    {
      id: "qr",
      label: "QR Studio",
      icon: QrCode,
      isActive: activeItem === "qr" || activeItem === "qrcode",
      onClick: onNavigateQrStudio,
    },
    {
      id: "analytics",
      label: "Reports & Analytics",
      icon: BarChart3,
      isActive: activeItem === "analytics" || activeItem === "statistics",
      onClick: () => {
        if (onNavigateAnalytics) onNavigateAnalytics();
        else if (onCloudClick) onCloudClick();
        else window.location.href = "/analytics";
      },
    },
    {
      id: "storedirectors",
      label: "Store Counters",
      icon: Store,
      isActive: activeItem === "storedirectors",
      onClick: onNavigateStoreDirectors,
    },
  ];

  return (
    <aside
      className={`bg-[#151618] rounded-[22px] md:rounded-[32px] p-2 md:py-3.5 md:px-2 flex md:flex-col justify-between items-center shadow-2xl transition-all duration-300 ease-in-out z-40 fixed left-2 sm:left-3 md:left-3.5 top-3 sm:top-4 md:top-5 w-[calc(100%-16px)] sm:w-[calc(100%-24px)] md:h-[calc(100vh-40px)] max-h-[calc(100vh-40px)] ${
        isExpanded ? "md:w-[210px]" : "md:w-[62px]"
      }`}
    >
      {/* Top Group: Toggle Button & Main Navigation Links */}
      <div className="flex md:flex-col items-center gap-2 md:gap-2.5 w-full justify-around md:justify-start">
        {/* Toggle Expand / Collapse Sidebar with clean label */}
        <div className="relative group flex items-center w-full mb-1">
          <button
            type="button"
            onClick={handleToggleExpand}
            className={`w-8 h-8 md:w-full rounded-xl bg-white/10 hover:bg-[#e5fc73] hover:text-[#111] text-gray-300 flex items-center transition-all duration-200 cursor-pointer shadow-sm shrink-0 ${
              isExpanded ? "justify-between px-3 h-9" : "justify-center"
            }`}
          >
            {isExpanded ? (
              <>
                <span className="text-[11px] font-bold uppercase tracking-wider">Collapse Menu</span>
                <ChevronLeft size={16} strokeWidth={2.5} />
              </>
            ) : (
              <ChevronRight size={16} strokeWidth={2.5} />
            )}
          </button>
          {!isExpanded && (
            <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5fc73]" />
              <span>Expand Sidebar</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="relative group flex items-center w-full">
              <button
                type="button"
                onClick={item.onClick}
                className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer shrink-0 ${
                  isExpanded ? "px-3 gap-3 justify-start" : "justify-center"
                } ${
                  item.isActive
                    ? "bg-[#27282d] text-white shadow-inner relative md:after:content-[''] md:after:block md:after:absolute md:after:-right-1 md:after:w-1 md:after:h-3 md:after:bg-[#e5fc73] md:after:rounded-l"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {isExpanded && (
                  <span className="text-xs font-bold text-gray-200 truncate">{item.label}</span>
                )}
              </button>

              {/* Instant High-Contrast Floating Tooltip (Visible in Compact Mode on Hover) */}
              {!isExpanded && (
                <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? "bg-[#e5fc73]" : "bg-gray-400"}`} />
                  <span>{item.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Group: Help, Profile & Sign Out */}
      <div className="flex md:flex-col items-center gap-2 md:gap-2.5 w-full justify-around md:justify-end">
        {/* Help & Guides */}
        <div className="relative group flex items-center w-full">
          <button
            type="button"
            onClick={onHelpClick}
            className={`w-full h-10 rounded-xl flex items-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer shrink-0 ${
              isExpanded ? "px-3 gap-3 justify-start" : "justify-center"
            }`}
          >
            <BookOpen size={18} className="shrink-0" />
            {isExpanded && (
              <span className="text-xs font-bold text-gray-200 truncate">Help &amp; Guides</span>
            )}
          </button>
          {!isExpanded && (
            <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Help &amp; Guides</span>
            </div>
          )}
        </div>

        {/* Profile Button */}
        <div className="relative group flex items-center w-full">
          <button
            type="button"
            onClick={onProfileClick}
            className={`w-full h-10 rounded-xl flex items-center transition-all duration-200 cursor-pointer shrink-0 ${
              isExpanded ? "px-2.5 gap-2.5 justify-start bg-white/5 hover:bg-white/10" : "justify-center"
            }`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#30333a] overflow-hidden bg-[#24252a] shrink-0 flex items-center justify-center">
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
            </div>
            {isExpanded && (
              <div className="min-w-0 text-left">
                <div className="text-xs font-bold text-white truncate leading-none">
                  {storedUser?.name || "Mall Admin"}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-1">Admin Profile</div>
              </div>
            )}
          </button>
          {!isExpanded && (
            <div className="hidden md:flex absolute left-full ml-3 px-3 py-1.5 bg-[#1f2227] text-white text-xs font-bold rounded-xl shadow-2xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 z-50 whitespace-nowrap items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Admin Profile</span>
            </div>
          )}
        </div>

        {/* Sign Out Button (when expanded) */}
        {isExpanded && (
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full h-9 rounded-xl flex items-center px-3 gap-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold truncate">Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
});

export default DockSidebar;
