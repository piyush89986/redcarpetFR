import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Store,
  QrCode,
  Users,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import API_BASE from "../apiConfig";

// Reusable Modular Dashboard Components from existing design system
import DockSidebar from "./dashboard/DockSidebar";
import TabsNav from "./dashboard/TabsNav";
import SearchBar from "./dashboard/SearchBar";
import ProfileModal from "./dashboard/ProfileModal";
import HelpModal from "./dashboard/HelpModal";
import Toast from "./dashboard/Toast";

const TABS = ["Store Counters", "Real Scans Log", "Recent Activity"];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();

  // Resolve business/mall identifier strictly for the logged-in manager
  const storedShopId = localStorage.getItem("shopId");
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);
  const effectiveShopId = storedShopId || storedUser?.shopId || storedUser?.mallId || "";

  // Data & State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Store Counters");

  // Layout & Modal states
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for collapsible header
  useEffect(() => {
    const handleScroll = () => {
      const fourthCard = document.querySelector("[data-card-index='3']");
      let collapseThreshold = 460;

      if (fourthCard) {
        const rect = fourthCard.getBoundingClientRect();
        const cardAbsoluteTop = rect.top + window.scrollY;
        collapseThreshold = Math.max(300, cardAbsoluteTop - 80);
      }

      const y = window.scrollY;
      if (y > collapseThreshold) setIsScrolled(true);
      else if (y < collapseThreshold - 120) setIsScrolled(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }, []);

  // Fetch real analytics strictly scoped to this particular mall / business
  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const url = effectiveShopId
        ? `${API_BASE}/api/analytics/overview?mallId=${effectiveShopId}`
        : `${API_BASE}/api/analytics/overview`;
      const res = await axios.get(url);
      if (res.data?.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
      if (!silent) showToast("Failed to refresh analytics.");
    } finally {
      setIsLoading(false);
    }
  }, [effectiveShopId, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real Database Metrics for this business
  const metrics = analyticsData?.metrics || {
    totalMalls: 1,
    activeMalls: 1,
    totalStores: 0,
    activeStores: 0,
    totalQrScans: 0,
    todayQrScans: 0,
    totalTokensIssued: 0,
    todayTokensIssued: 0,
    averageConversionRate: 0,
  };

  const businessInfo = analyticsData?.businessInfo || {
    title: storedUser?.name || "Business Complex",
    city: "Primary Location",
  };

  const rawStores = useMemo(() => analyticsData?.stores || [], [analyticsData]);
  const rawRecent = useMemo(() => analyticsData?.recentActivity || [], [analyticsData]);

  // Filtered Stores
  const filteredStores = useMemo(() => {
    if (!search) return rawStores;
    const q = search.toLowerCase();
    return rawStores.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.mallTitle?.toLowerCase().includes(q)
    );
  }, [rawStores, search]);

  // Filtered Scans Log (type === 'scan')
  const rawScansOnly = useMemo(() => {
    return rawRecent.filter((r) => r.type === "scan");
  }, [rawRecent]);

  const filteredScans = useMemo(() => {
    if (!search) return rawScansOnly;
    const q = search.toLowerCase();
    return rawScansOnly.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q)
    );
  }, [rawScansOnly, search]);

  // Filtered All Recent Logs
  const filteredRecent = useMemo(() => {
    if (!search) return rawRecent;
    const q = search.toLowerCase();
    return rawRecent.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q)
    );
  }, [rawRecent, search]);

  const tabCounts = {
    "Store Counters": rawStores.length,
    "Real Scans Log": rawScansOnly.length,
    "Recent Activity": rawRecent.length,
  };

  // Proportional calculation for internal store footfall distribution
  const maxStoreTokens = useMemo(() => {
    if (!rawStores.length) return 1;
    const maxVal = Math.max(...rawStores.map((s) => s.totalTokens || 0));
    return maxVal > 0 ? maxVal : 1;
  }, [rawStores]);

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-white w-full py-4 sm:py-6 lg:py-7 pr-4 sm:pr-6 lg:pr-8 pl-4 pt-16 md:pt-5 md:pl-[100px] lg:pl-[108px] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] box-border selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Toast Notification */}
      <Toast message={toastMessage} isVisible={!!toastMessage} />

      {/* Profile & Help Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSignOut={() => {
          localStorage.clear();
          navigate("/");
        }}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        role="admin"
      />

      {/* Reusable Left Floating Dock Navigation */}
      <DockSidebar
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
        activeItem="analytics"
        onNavigateHome={() => navigate(effectiveShopId ? `/branddashboard2/${effectiveShopId}` : "/statistics")}
        onNavigateQrStudio={() => navigate(effectiveShopId ? `/qrcode?mallId=${effectiveShopId}` : "/qrcode")}
        onNavigateStoreDirectors={() => navigate(effectiveShopId ? `/branddashboard2/${effectiveShopId}` : "/statistics")}
        onNavigateAnalytics={() => {
          fetchAnalytics();
        }}
        onCloudClick={() => {
          fetchAnalytics();
        }}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* Main Full-Screen Canvas */}
      <main className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0 w-full">
        {/* Luxury Header Area with REDCARPET Watermark (Collapses smoothly on scroll) */}
        <header
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled
              ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none mb-0 py-0"
              : "max-h-56 opacity-100 translate-y-0 mb-1 pt-1 pb-1"
          }`}
        >
          {/* Luxury REDCARPET Backdrop Branding Watermark */}
          <div
            aria-hidden="true"
            className="absolute -top-7 -left-2 text-6xl sm:text-7xl lg:text-[88px] font-black tracking-[0.25em] text-red-600/[0.05] select-none pointer-events-none uppercase -z-10 whitespace-nowrap leading-none"
          >
            REDCARPET
          </div>

          {/* RedCarpet Brand Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 text-red-700 text-[11px] sm:text-xs font-black uppercase tracking-wider border border-red-600/20 mb-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>
              {businessInfo.title
                ? `${businessInfo.title.toUpperCase()} • LIVE TELEMETRY`
                : "VENUE PERFORMANCE"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-[#141619] leading-tight m-0">
            <span className="inline-flex items-center flex-wrap gap-2">
              {businessInfo.title || "Business"}
              <span className="w-8 h-8 rounded-full bg-white border border-[#e2e5e4] shadow-xs flex items-center justify-center text-gray-900 transition-transform hover:rotate-12 cursor-pointer">
                <BarChart3 size={17} strokeWidth={2.2} />
              </span>
              Statistics &amp; Telemetry
            </span>
            <br className="hidden sm:inline" />
            <span className="inline-flex items-center flex-wrap gap-2 sm:mt-1">
              and
              <span className="px-3 py-1 rounded-full bg-[#e5fc73] text-gray-950 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-transform hover:-rotate-3 cursor-pointer">
                <Activity size={14} strokeWidth={2.5} />
                Store Counter
              </span>
              Customer Footfall
            </span>
          </h1>
        </header>

        {/* Real Summary Metric Cards (Clean Light Theme) Scoped To This Business */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Real Tokens Issued */}
          <div
            data-card-index="0"
            className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 rounded-[22px] p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                VIP Customers Served
              </span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                {metrics.totalTokensIssued.toLocaleString()}
              </span>
              <p className="text-xs text-gray-500 mt-1 m-0">
                Customer tokens generated for this venue
              </p>
            </div>
          </div>

          {/* Card 2: Active Brand Counters (Replaced Multi-Mall card) */}
          <div
            data-card-index="1"
            className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 rounded-[22px] p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Active Brand Counters
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#e5fc73]/40 text-gray-950 flex items-center justify-center">
                <Store size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  {metrics.activeStores}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  of {metrics.totalStores} Total Desks
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Live
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 m-0">
                Store queue counters registered in this mall
              </p>
            </div>
          </div>

          {/* Card 3: Verified Live QR Scans */}
          <div
            data-card-index="2"
            className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 rounded-[22px] p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Verified QR Scans
              </span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <QrCode size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                {metrics.totalQrScans.toLocaleString()}
              </span>
              <p className="text-xs text-gray-500 mt-1 m-0">
                Live scans captured from customer passes
              </p>
            </div>
          </div>

          {/* Card 4: Daily Conversion Rate */}
          <div
            data-card-index="3"
            className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 rounded-[22px] p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Scan-to-Queue Ratio
              </span>
              <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                  {metrics.averageConversionRate}%
                </span>
                <span className="text-[11px] font-bold text-gray-900 bg-[#e5fc73] px-2 py-0.5 rounded-full">
                  High Engagement
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 m-0">
                Conversion rate from QR scans to tokens
              </p>
            </div>
          </div>
        </section>

        {/* Store Counters Footfall & Queue Distribution Section (Replaced Multi-Mall Comparison) */}
        <section className="bg-[#fafbfb] border border-gray-200/80 rounded-[24px] p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 m-0">
                <TrendingUp size={18} className="text-gray-900" />
                Store Counters Footfall &amp; Queue Distribution
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 m-0">
                Real customer tokens issued and queue volume across each brand desk in {businessInfo.title}
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-full self-start sm:self-auto">
              Real Complex Telemetry
            </span>
          </div>

          {/* Visual Bars Comparison for Stores inside this Mall */}
          <div className="mt-4 space-y-3">
            {rawStores.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No store counters configured for this complex yet.
              </p>
            ) : (
              rawStores.map((store) => {
                const tokens = store.totalTokens || 0;
                const pct = maxStoreTokens > 0 ? Math.round((tokens / maxStoreTokens) * 100) : 0;
                return (
                  <div key={store.storeId} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                      <span className="truncate max-w-[280px] sm:max-w-md font-bold">{store.name}</span>
                      <span className="shrink-0 text-gray-900 font-bold">
                        {tokens} Customers ({store.totalQrScans || 0} Scans)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                      <div
                        style={{ width: `${Math.max(pct, 5)}%` }}
                        className="h-full bg-[#111215] rounded-full transition-all duration-500 relative"
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#e5fc73] rounded-r-full" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Sticky Controls Row: Horizontal Tabs Navbar + Refresh Button + Search Bar */}
        <div
          className={`sticky top-0 z-30 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 py-2.5 sm:py-3 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] -mx-2 px-2 sm:-mx-4 sm:px-4"
              : "bg-white border-b border-gray-100"
          }`}
        >
          {/* Horizontal Navbar Tabs */}
          <TabsNav
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              showToast(`Showing: ${tab}`);
            }}
            counts={tabCounts}
          />

          {/* Right Controls: Refresh Button & Search Bar */}
          <div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                fetchAnalytics();
                showToast("Statistics synchronized from database");
              }}
              title="Refresh Statistics"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-[#e7ebe8] flex items-center justify-center text-gray-700 hover:text-black shadow-xs transition-transform duration-200 active:rotate-180 cursor-pointer shrink-0"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-black" : ""} />
            </button>

            {/* Reusable Search Bar */}
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search store counters..."
            />
          </div>
        </div>

        {/* TAB 1: STORE COUNTERS (3 Cards Per Row) */}
        {activeTab === "Store Counters" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStores.map((store) => (
              <div
                key={store.storeId}
                className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 hover:border-gray-300 rounded-[22px] p-4 sm:p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    {/* Store Logo */}
                    <div className="w-14 h-14 min-w-[56px] rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Store size={22} className="text-gray-400" />
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 truncate m-0">
                          {store.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            store.subscriptionStatus === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {store.subscriptionStatus}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 truncate mt-1 m-0">
                        📍 {store.mallTitle || businessInfo.title}
                      </p>

                      {/* Genuine Stats Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span className="text-[11px] font-bold text-gray-900 bg-white border border-gray-200 px-2 py-0.5 rounded-md shadow-2xs">
                          🎟️ {store.totalTokens || 0} Tokens
                        </span>
                        <span className="text-[11px] font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                          📲 {store.totalQrScans || 0} Scans
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200/60">
                  <span className="text-[11px] text-gray-400">
                    Counter Desk
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/${store.storeId}/counter`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111] hover:text-black bg-white hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Open Live Counter</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            ))}

            {filteredStores.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 text-sm">
                No store counters found matching "{search}".
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REAL SCANS LOG */}
        {activeTab === "Real Scans Log" && (
          <div className="bg-[#fafbfb] border border-gray-200/80 rounded-[24px] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 m-0">
                  Real Scans &amp; Customer Visits for {businessInfo.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 m-0">
                  Real records saved directly into the database when customers scan QR passes at this complex
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full">
                {filteredScans.length} Real Scans
              </span>
            </div>

            <div className="space-y-2">
              {filteredScans.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="bg-white border border-gray-200/80 rounded-[16px] p-3.5 flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-800">
                      <QrCode size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-[13px] font-bold text-gray-900 truncate">
                        {log.title}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {log.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#e5fc73]/40 text-gray-950 border border-[#e5fc73]">
                      QR Scan
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatTimeAgo(log.time)}
                    </span>
                  </div>
                </div>
              ))}

              {filteredScans.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No scan logs found. Customer scans in real time will appear here automatically.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RECENT ACTIVITY */}
        {activeTab === "Recent Activity" && (
          <div className="bg-[#fafbfb] border border-gray-200/80 rounded-[24px] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 m-0">
                  Live Queue &amp; Check-In Activity
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 m-0">
                  Real-time timeline of tokens issued and guest scans at {businessInfo.title}
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full">
                {filteredRecent.length} Events
              </span>
            </div>

            <div className="space-y-2">
              {filteredRecent.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="bg-white border border-gray-200/80 rounded-[16px] p-3.5 flex items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-800">
                      {log.type === "scan" ? <QrCode size={16} /> : <Users size={16} />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-[13px] font-bold text-gray-900 truncate">
                        {log.title}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate mt-0.5">
                        {log.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        log.type === "token"
                          ? "bg-blue-50 text-blue-800 border border-blue-200"
                          : "bg-[#e5fc73]/40 text-gray-950 border border-[#e5fc73]"
                      }`}
                    >
                      {log.badge}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatTimeAgo(log.time)}
                    </span>
                  </div>
                </div>
              ))}

              {filteredRecent.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No activity found. Live token dispatches and scans will appear here automatically.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
