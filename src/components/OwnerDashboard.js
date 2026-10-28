import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Settings, Link2, RefreshCw, Building2 } from "lucide-react";
import API_BASE from "../apiConfig";
import { useAppDispatch, useAppSelector, fetchMalls, toggleSubscription } from "../redux";

// Reusable Modular Dashboard Components
import DockSidebar from "./dashboard/DockSidebar";
import TabsNav from "./dashboard/TabsNav";
import SearchBar from "./dashboard/SearchBar";
import MallCard from "./dashboard/MallCard";
import MallModal from "./dashboard/MallModal";
import ProfileModal from "./dashboard/ProfileModal";
import HelpModal from "./dashboard/HelpModal";
import Toast from "./dashboard/Toast";

const TABS = ["All Complexes", "Active Subscriptions", "Inactive Malls", "Store Directors"];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { malls: reduxMalls } = useAppSelector((state) => state.malls);

  // Core Data & Filter States
  const [shops, setFoods] = useState(reduxMalls || []);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Complexes");

  // Layout & Navigation State
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [activeDockItem, setActiveDockItem] = useState("home");

  // Modal Visibility States
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mall: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Scroll animation state for collapsible header: triggers after scrolling past the 4th card
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Find 4th card in the grid (0-indexed: index 3)
      const fourthCard = document.querySelector("[data-card-index='3']");
      let collapseThreshold = 460; // fallback if fewer cards

      if (fourthCard) {
        const rect = fourthCard.getBoundingClientRect();
        const cardAbsoluteTop = rect.top + window.scrollY;
        // Trigger collapse when user scrolls past the 4th card
        collapseThreshold = Math.max(300, cardAbsoluteTop - 80);
      }

      const currentScrollY = window.scrollY;
      if (currentScrollY > collapseThreshold) {
        setIsScrolled(true);
      } else if (currentScrollY < collapseThreshold - 120) {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Role Protection
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase().trim();
    const shopId = localStorage.getItem("shopId");
    if (role && role !== "superadmin") {
      if (role === "admin" && shopId) {
        navigate(`/branddashboard2/${shopId}`, { replace: true });
      } else if ((role === "shop admin" || role === "shopadmin" || role === "shop") && shopId) {
        navigate(`/${shopId}/counter`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [navigate]);

  // Sync when Redux updates
  useEffect(() => {
    if (reduxMalls && reduxMalls.length > 0) {
      setFoods(reduxMalls);
    }
  }, [reduxMalls]);

  // Initial Fetch
  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchMalls())
      .unwrap()
      .then((data) => setFoods(data || []))
      .catch((err) => console.error("Error fetching shops:", err))
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  // Toast feedback helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  }, []);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    dispatch(fetchMalls())
      .unwrap()
      .then((data) => {
        setFoods(data || []);
        showToast("Malls synchronized from cloud");
      })
      .catch((err) => console.error("Error fetching malls:", err))
      .finally(() => setIsLoading(false));
  }, [dispatch, showToast]);

  // Toggle Subscription Handler (Optimistic with zero unnecessary full-screen re-renders)
  const handleToggleSubscription = useCallback(
    async (mallId, currentStatus) => {
      const nextStatus = currentStatus === "inactive" ? "active" : "inactive";

      // Optimistic local update
      setFoods((prev) =>
        prev.map((s) => (s._id === mallId ? { ...s, subscriptionStatus: nextStatus } : s))
      );
      showToast(`Subscription set to ${nextStatus.toUpperCase()}`);

      try {
        await dispatch(toggleSubscription({ mallId, subscriptionStatus: nextStatus })).unwrap();
      } catch (err) {
        console.error("Subscription update error:", err);
        // Revert on error
        setFoods((prev) =>
          prev.map((s) => (s._id === mallId ? { ...s, subscriptionStatus: currentStatus } : s))
        );
        alert("Failed to update subscription status. Please ensure backend is running.");
      }
    },
    [dispatch, showToast]
  );

  // Manage Stores Navigation Handler
  const handleManageStores = useCallback(
    (mallId) => {
      navigate(`/branddashboard2/${mallId}`);
    },
    [navigate]
  );

  // Open Edit Modal
  const handleEdit = useCallback((mall) => {
    setModalConfig({ isOpen: true, mall });
  }, []);

  // Delete Handler
  const handleDelete = useCallback(
    (id, title) => {
      if (window.confirm(`Are you sure you want to delete "${title || "this mall"}"?`)) {
        axios
          .delete(`${API_BASE}/api/shops/${id}`)
          .then(() => {
            setFoods((prev) => prev.filter((shop) => shop._id !== id));
            showToast(`"${title || "Mall"}" deleted successfully.`);
          })
          .catch((err) => {
            console.error("Error deleting shop:", err);
            alert("Failed to delete mall: " + (err.response?.data?.message || err.message));
          });
      }
    },
    [showToast]
  );

  // Add / Edit Form Submit Handler
  const handleFormSubmit = useCallback(
    (formData, editId) => {
      setIsSubmitting(true);
      if (editId) {
        axios
          .put(`${API_BASE}/api/shops/${editId}`, formData)
          .then((res) => {
            setFoods((prev) => prev.map((s) => (s._id === editId ? res.data : s)));
            setModalConfig({ isOpen: false, mall: null });
            showToast(`Mall "${formData.title}" updated successfully!`);
          })
          .catch((err) => {
            console.error("Error updating shop:", err);
            alert("Failed to update mall: " + (err.response?.data?.message || err.message));
          })
          .finally(() => setIsSubmitting(false));
      } else {
        axios
          .post(`${API_BASE}/api/shops`, formData)
          .then((res) => {
            setFoods((prev) => [...prev, res.data]);
            setModalConfig({ isOpen: false, mall: null });
            showToast(`Mall "${formData.title}" added to directory!`);
          })
          .catch((err) => {
            console.error("Error creating shop:", err);
            alert("Failed to add mall: " + (err.response?.data?.message || err.message));
          })
          .finally(() => setIsSubmitting(false));
      }
    },
    [showToast]
  );

  // Sign out Handler
  const handleSignOut = useCallback(() => {
    localStorage.clear();
    navigate("/");
  }, [navigate]);

  // Tab Counts Memo
  const tabCounts = useMemo(() => {
    const activeMalls = shops.filter((s) => s.subscriptionStatus !== "inactive").length;
    const inactiveMalls = shops.filter((s) => s.subscriptionStatus === "inactive").length;
    const totalStores = shops.reduce(
      (acc, s) => acc + (s.menuItems ? s.menuItems.length : 0),
      0
    );

    return {
      "All Complexes": shops.length,
      "Active Subscriptions": activeMalls,
      "Inactive Malls": inactiveMalls,
      "Store Directors": totalStores
    };
  }, [shops]);

  // Filtered Shops Memo
  const displayedShops = useMemo(() => {
    return shops.filter((shop) => {
      // 1. Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          (shop.title && shop.title.toLowerCase().includes(q)) ||
          (shop.description && shop.description.toLowerCase().includes(q)) ||
          (shop.email && shop.email.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Tab Filter
      if (activeTab === "Active Subscriptions") {
        return shop.subscriptionStatus !== "inactive";
      }
      if (activeTab === "Inactive Malls") {
        return shop.subscriptionStatus === "inactive";
      }
      return true; // "All Complexes" & "Store Directors"
    });
  }, [shops, search, activeTab]);

  return (
    <div className="min-h-screen bg-white w-full py-4 sm:py-6 lg:py-7 pr-4 sm:pr-6 lg:pr-8 pl-4 pt-16 md:pt-5 md:pl-[100px] lg:pl-[108px] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] box-border selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Reusable Left Floating Dock Navigation (Fixed Overlay above the page) */}
      <DockSidebar
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
        onAddMall={() => setModalConfig({ isOpen: true, mall: null })}
        activeItem={activeDockItem}
        onNavigateHome={() => {
          setActiveDockItem("home");
          setActiveTab("All Complexes");
        }}
        onNavigateQrStudio={() => navigate("/qrcode")}
        onNavigateStoreDirectors={() => {
          setActiveDockItem("stores");
          setActiveTab("Store Directors");
        }}
        onNavigateAnalytics={() => navigate("/analytics")}
        onCloudClick={() => navigate("/analytics")}
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
            <span>RED CARPET PLATFORM</span>
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold tracking-tight text-[#141619] leading-tight m-0">
            <span className="inline-flex items-center flex-wrap gap-2">
              Managing
              <span className="w-8 h-8 rounded-full bg-white border border-[#e2e5e4] shadow-xs flex items-center justify-center text-gray-900 transition-transform hover:rotate-12 cursor-pointer">
                <Settings size={17} strokeWidth={2.2} />
              </span>
              Your Complexes
            </span>
            <br className="hidden sm:inline" />
            <span className="inline-flex items-center flex-wrap gap-2 sm:mt-1">
              and
              <span className="px-3 py-1 rounded-full bg-[#e5fc73] text-gray-950 text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-transform hover:-rotate-3 cursor-pointer">
                <Link2 size={14} strokeWidth={2.5} />
                Queues
              </span>
              Workflows
            </span>
          </h1>
        </header>

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
            onTabChange={setActiveTab}
            counts={tabCounts}
          />

          {/* Right Controls: Refresh Button & Search Bar */}
          <div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleRefresh}
              title="Refresh Malls Data"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-[#e7ebe8] flex items-center justify-center text-gray-700 hover:text-black shadow-xs transition-transform duration-200 active:rotate-180 cursor-pointer shrink-0"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-black" : ""} />
            </button>

            {/* Reusable Debounced Search Bar */}
            <SearchBar
              value={search}
              onChange={(query) => setSearch(query)}
              placeholder="Search malls, cities, emails..."
            />
          </div>
        </div>

        {/* Full-Screen Cards Section: Exactly 3 cards per row on desktop */}
        <section className="flex-1 w-full" aria-label="Registered Malls and Complexes">
          {isLoading && shops.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-500">
              <RefreshCw size={26} className="animate-spin mx-auto mb-3 text-gray-400" />
              Loading shopping complexes...
            </div>
          ) : displayedShops.length === 0 ? (
            <div className="py-16 px-4 text-center bg-[#fafbfb] rounded-[24px] border border-dashed border-gray-200">
              <Building2 size={36} className="mx-auto mb-2 text-gray-400" />
              <h4 className="text-sm font-bold text-gray-800 m-0">No shopping complexes found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No complexes match "${search}". Try adjusting your keywords.`
                  : "Click '+ Register New Mall' in the left dock to add your first shopping complex."}
              </p>
              <button
                type="button"
                onClick={() => setModalConfig({ isOpen: true, mall: null })}
                className="mt-4 text-xs font-semibold bg-[#111] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-sm"
              >
                + Register Complex
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedShops.map((mall, idx) => (
                <div key={mall._id} data-card-index={idx}>
                  <MallCard
                    mall={mall}
                    onToggleSubscription={handleToggleSubscription}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onManageStores={handleManageStores}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Self-contained Add / Edit Modal (Form state is isolated to prevent parent re-renders) */}
      <MallModal
        isOpen={modalConfig.isOpen}
        initialData={modalConfig.mall}
        onClose={() => setModalConfig({ isOpen: false, mall: null })}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* SuperAdmin Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        totalMalls={shops.length}
        activeLicenses={tabCounts["Active Subscriptions"]}
        onSignOut={handleSignOut}
      />

      {/* Help & Guides Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} role="superadmin" />

      {/* Reusable Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default OwnerDashboard;
