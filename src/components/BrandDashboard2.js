import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Building2, Plus, RefreshCw, ArrowLeft, Store, AlertTriangle, ShieldCheck } from "lucide-react";
import API_BASE from "../apiConfig";

// Reusable Components
import DockSidebar from "./dashboard/DockSidebar";
import TabsNav from "./dashboard/TabsNav";
import SearchBar from "./dashboard/SearchBar";
import StoreCard from "./dashboard/StoreCard";
import StoreModal from "./dashboard/StoreModal";
import StoreQrModal from "./dashboard/StoreQrModal";
import ProfileModal from "./dashboard/ProfileModal";
import HelpModal from "./dashboard/HelpModal";
import Toast from "./dashboard/Toast";

const STORE_TABS = ["All Stores", "Active Counters", "Inactive Brands"];

const BrandDashboard2 = () => {
  const { id: paramId } = useParams();
  const storedShopId = localStorage.getItem("shopId");
  const userRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const navigate = useNavigate();

  // Enforce access control: Admin can only access their own mall
  useEffect(() => {
    if (userRole === "admin" && storedShopId && paramId && paramId !== storedShopId) {
      console.warn("Access Restricted: Admin can only manage their own assigned mall.");
      navigate(`/branddashboard2/${storedShopId}`, { replace: true });
    }
  }, [userRole, storedShopId, paramId, navigate]);

  const id = userRole === "admin" && storedShopId ? storedShopId : (paramId || storedShopId);

  // Mall & Stores Data State
  const [shop, setShop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Stores");

  // Dock & Scroll Animation State
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Modals State
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [isSubmittingStore, setIsSubmittingStore] = useState(false);

  // QR Modal State
  const [selectedStoreForQr, setSelectedStoreForQr] = useState(null);
  const [assignedQrUrl, setAssignedQrUrl] = useState("");
  const [isSavingQr, setIsSavingQr] = useState(false);
  const [qrSaveMsg, setQrSaveMsg] = useState("");

  // Profile & Help Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Base QR URL calculation
  const BASE_QR_URL =
    process.env.REACT_APP_FRONTEND_URL ||
    (typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
      ? window.location.origin
      : "https://redcarpet-fr.vercel.app");

  // Scroll listener for collapsible header: triggers after scrolling past the 4th store card
  useEffect(() => {
    const handleScroll = () => {
      const fourthStore = document.querySelector("[data-store-card-index='3']");
      let collapseThreshold = 460;

      if (fourthStore) {
        const rect = fourthStore.getBoundingClientRect();
        const cardAbsoluteTop = rect.top + window.scrollY;
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

  // Toast feedback helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  }, []);

  // Fetch Mall & Store Details
  const fetchShopDetails = useCallback(async () => {
    if (!id || id === "undefined") {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/api/shops/${id}`);
      setShop(res.data);
    } catch (err) {
      console.error("Error fetching mall details:", err);
      showToast("Failed to fetch mall data.");
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchShopDetails();
  }, [fetchShopDetails]);

  // Open QR Pass Modal for Store
  const handleOpenQrModal = useCallback(
    async (item) => {
      setSelectedStoreForQr(item);
      setQrSaveMsg("");
      const defaultUrl = `${BASE_QR_URL}/${item._id}`;
      setAssignedQrUrl(defaultUrl);

      try {
        const res = await axios.get(`${API_BASE}/api/qrcode/${item._id}`);
        if (res.data?.success && res.data.data?.qrUrl) {
          let url = res.data.data.qrUrl;
          if (
            url.includes("localhost") ||
            url.includes("127.0.0.1")
          ) {
            url = `${BASE_QR_URL}/${item._id}`;
          }
          setAssignedQrUrl(url);
        }
      } catch (err) {
        // Fallback to default
      }
    },
    [BASE_QR_URL]
  );

  // Save QR Code assignment
  const handleSaveAssignedQr = useCallback(async () => {
    if (!selectedStoreForQr) return;
    setIsSavingQr(true);
    setQrSaveMsg("");

    try {
      await axios.post(`${API_BASE}/api/qrcode/${selectedStoreForQr._id}`, {
        qrUrl: assignedQrUrl.trim(),
        size: 240,
      });
      setQrSaveMsg(`QR pass saved for ${selectedStoreForQr.name}!`);
      showToast("Store QR pass updated successfully");
      setTimeout(() => setQrSaveMsg(""), 3500);
      fetchShopDetails();
    } catch (err) {
      console.error("Error saving QR:", err);
      setQrSaveMsg("Failed to save QR pass.");
    } finally {
      setIsSavingQr(false);
    }
  }, [selectedStoreForQr, assignedQrUrl, fetchShopDetails, showToast]);

  // Add / Edit Store Form Submit
  const handleStoreFormSubmit = useCallback(
    async (formData, editingItem) => {
      if (!shop?._id) return;
      setIsSubmittingStore(true);

      if (editingItem && editingItem.name) {
        // Edit Mode
        try {
          await axios.put(`${API_BASE}/api/shops/update-menu-item/${id}/${editingItem.name}`, {
            newName: formData.name,
            newDescription: formData.description,
            newImage: formData.image,
            newLink: formData.link,
            newEmail: formData.email,
            newPassword: formData.password,
            newShopConPassword: formData.shopconpassword,
            newRole: formData.role || "shop admin",
          });
          setIsStoreModalOpen(false);
          setEditingStore(null);
          fetchShopDetails();
          showToast(`Store "${formData.name}" updated successfully!`);
        } catch (err) {
          console.error("Error updating brand:", err);
          alert("Failed to update store: " + (err.response?.data?.message || err.message));
        } finally {
          setIsSubmittingStore(false);
        }
      } else {
        // Add Mode
        try {
          await axios.post(`${API_BASE}/api/shops/${shop._id}/menu`, {
            ...formData,
            role: "shop admin",
          });
          setIsStoreModalOpen(false);
          setEditingStore(null);
          fetchShopDetails();
          showToast(`Store "${formData.name}" created successfully!`);
        } catch (err) {
          console.error("Error adding brand:", err.response?.data || err.message);
          alert("Failed to add store: " + (err.response?.data?.message || err.message));
        } finally {
          setIsSubmittingStore(false);
        }
      }
    },
    [shop, id, fetchShopDetails, showToast]
  );

  // Delete Store Handler
  const handleDeleteStore = useCallback(
    async (item) => {
      if (window.confirm(`Are you sure you want to delete "${item.name}" from this mall?`)) {
        try {
          await axios.delete(`${API_BASE}/api/shops/delete-menu-item/${id}/${item.name}`);
          fetchShopDetails();
          showToast(`"${item.name}" deleted from complex.`);
        } catch (err) {
          console.error("Error deleting shop:", err);
          alert("Failed to delete store.");
        }
      }
    },
    [id, fetchShopDetails, showToast]
  );

  // Toggle Store Active/Inactive Status
  const handleToggleStoreStatus = useCallback(
    async (item) => {
      const current = item.subscriptionStatus || "active";
      const next = current === "inactive" ? "active" : "inactive";

      // Optimistic update
      setShop((prev) => {
        if (!prev || !prev.menuItems) return prev;
        return {
          ...prev,
          menuItems: prev.menuItems.map((m) =>
            m._id === item._id ? { ...m, subscriptionStatus: next } : m
          ),
        };
      });

      showToast(`${item.name} set to ${next.toUpperCase()}`);

      try {
        await axios.put(`${API_BASE}/api/shops/update-menu-item/${id}/${item.name}`, {
          newName: item.name,
          newDescription: item.description,
          newImage: item.image,
          newLink: item.link,
          newEmail: item.email,
          subscriptionStatus: next,
        });
      } catch (err) {
        console.error("Error toggling store status:", err);
        // Revert on error
        setShop((prev) => {
          if (!prev || !prev.menuItems) return prev;
          return {
            ...prev,
            menuItems: prev.menuItems.map((m) =>
              m._id === item._id ? { ...m, subscriptionStatus: current } : m
            ),
          };
        });
      }
    },
    [id, showToast]
  );

  // Filtered Stores Memo
  const menuItems = useMemo(() => shop?.menuItems || [], [shop]);

  const filteredStores = useMemo(() => {
    return menuItems.filter((store) => {
      // 1. Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          (store.name && store.name.toLowerCase().includes(q)) ||
          (store.description && store.description.toLowerCase().includes(q)) ||
          (store.email && store.email.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Tab filter
      if (activeTab === "Active Counters") {
        return store.subscriptionStatus !== "inactive";
      }
      if (activeTab === "Inactive Brands") {
        return store.subscriptionStatus === "inactive";
      }
      return true; // "All Stores"
    });
  }, [menuItems, search, activeTab]);

  // Tab counts
  const storeCounts = useMemo(() => {
    const active = menuItems.filter((m) => m.subscriptionStatus !== "inactive").length;
    const inactive = menuItems.filter((m) => m.subscriptionStatus === "inactive").length;
    return {
      "All Stores": menuItems.length,
      "Active Counters": active,
      "Inactive Brands": inactive,
    };
  }, [menuItems]);

  // If Mall Subscription is Suspended
  if (shop && shop.subscriptionStatus === "inactive") {
    return (
      <div className="min-h-screen bg-white w-full flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#141619]">
        <div className="max-w-md w-full bg-[#fafbfb] border border-red-200/80 rounded-[32px] p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertTriangle size={32} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Account Suspended
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-950 m-0 mb-2">
            Subscription Has Expired
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
            Access to <strong>{shop.title || "this shopping complex"}</strong> and its brand counters has been paused by platform administration.
          </p>

          <div className="flex flex-col gap-2.5">
            {userRole === "superadmin" ? (
              <button
                type="button"
                onClick={() => navigate("/ownerdashboard")}
                className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#111] hover:bg-gray-800 text-white cursor-pointer transition-colors shadow-md"
              >
                Return to SuperAdmin Complexes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
                className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full py-4 sm:py-6 lg:py-7 pr-4 sm:pr-6 lg:pr-8 pl-4 pt-16 md:pt-5 md:pl-[100px] lg:pl-[108px] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] box-border selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Reusable Left Floating Dock Sidebar */}
      <DockSidebar
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
        onAddMall={() => {
          setEditingStore(null);
          setIsStoreModalOpen(true);
        }}
        activeItem="stores"
        onNavigateHome={() => navigate("/ownerdashboard")}
        onNavigateQrStudio={() => navigate(`/qrcode?mallId=${id}`)}
        onNavigateStoreDirectors={() => {
          setActiveTab("All Stores");
        }}
        onNavigateAnalytics={() => navigate("/analytics")}
        onCloudClick={() => navigate("/analytics")}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* Main Full-Screen Content Canvas */}
      <main className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0 w-full">
        {/* Luxury Collapsible Header with REDCARPET Backdrop Watermark */}
        <header
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled
              ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none mb-0 py-0"
              : "max-h-56 opacity-100 translate-y-0 mb-1 pt-1 pb-1"
          }`}
        >
          {/* Luxury Backdrop Watermark */}
          <div
            aria-hidden="true"
            className="absolute -top-7 -left-2 text-6xl sm:text-7xl lg:text-[88px] font-black tracking-[0.25em] text-red-600/[0.05] select-none pointer-events-none uppercase -z-10 whitespace-nowrap leading-none"
          >
            REDCARPET
          </div>

          {/* Navigation Breadcrumb / Mall Pill */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {userRole === "superadmin" && (
              <button
                type="button"
                onClick={() => navigate("/ownerdashboard")}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-[#e5fc73] text-gray-800 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={12} strokeWidth={2.8} />
                <span>All Complexes</span>
              </button>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 text-red-700 text-[11px] font-black uppercase tracking-wider border border-red-600/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>SHOPPING COMPLEX DIRECTORY</span>
            </div>
          </div>

          {/* Mall Title & Description */}
          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-[#141619] leading-tight m-0">
            {shop?.title || "Shopping Complex"}
            <span className="text-gray-400 font-normal text-lg sm:text-xl ml-2">
              • Store Counters
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mt-1 m-0">
            {shop?.description || "Manage brand counters, live token queues, and QR passes for this complex."}
          </p>
        </header>

        {/* Sticky Controls Row: Horizontal Tabs Navbar + Refresh + Search Bar */}
        <div
          className={`sticky top-0 z-30 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 py-2.5 sm:py-3 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] -mx-2 px-2 sm:-mx-4 sm:px-4"
              : "bg-white border-b border-gray-100"
          }`}
        >
          {/* Horizontal Navbar Tabs */}
          <TabsNav
            tabs={STORE_TABS}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              showToast(`Showing: ${tab}`);
            }}
            counts={storeCounts}
          />

          {/* Right Controls: Add Store, Refresh, Search Bar */}
          <div className="flex items-center gap-2.5 self-end md:self-auto w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                setEditingStore(null);
                setIsStoreModalOpen(true);
              }}
              className="bg-[#111215] hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-full inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Plus size={15} strokeWidth={2.8} />
              <span>Add Store</span>
            </button>

            <button
              type="button"
              onClick={fetchShopDetails}
              title="Refresh Stores"
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 border border-[#e7ebe8] flex items-center justify-center text-gray-700 hover:text-black shadow-xs transition-transform duration-200 active:rotate-180 cursor-pointer shrink-0"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-black" : ""} />
            </button>

            {/* Reusable Debounced Search Bar */}
            <SearchBar
              value={search}
              onChange={(query) => setSearch(query)}
              placeholder="Search stores, brands, staff..."
            />
          </div>
        </div>

        {/* Full-Screen Store Cards Grid: Strictly 3 cards per row */}
        <section className="flex-1 w-full" aria-label="Brand Stores in this complex">
          {isLoading && menuItems.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-500">
              <RefreshCw size={26} className="animate-spin mx-auto mb-3 text-gray-400" />
              Loading brand stores...
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="py-16 px-4 text-center bg-[#fafbfb] rounded-[24px] border border-dashed border-gray-200">
              <Store size={36} className="mx-auto mb-2 text-gray-400" />
              <h4 className="text-sm font-bold text-gray-800 m-0">No brand stores found</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No stores match "${search}". Try adjusting your keywords.`
                  : "Click '+ Add Store' to register your first brand counter in this mall."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingStore(null);
                  setIsStoreModalOpen(true);
                }}
                className="mt-4 text-xs font-semibold bg-[#111] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors shadow-sm"
              >
                + Register First Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredStores.map((item, idx) => (
                <div key={item._id || item.name} data-store-card-index={idx}>
                  <StoreCard
                    item={item}
                    onToggleStatus={handleToggleStoreStatus}
                    onOpenCounter={(storeId) => navigate(`/${storeId}/counter`)}
                    onOpenQr={handleOpenQrModal}
                    onEdit={(storeToEdit) => {
                      setEditingStore(storeToEdit);
                      setIsStoreModalOpen(true);
                    }}
                    onDelete={handleDeleteStore}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Store Add / Edit Modal */}
      <StoreModal
        isOpen={isStoreModalOpen}
        initialData={editingStore}
        onClose={() => {
          setIsStoreModalOpen(false);
          setEditingStore(null);
        }}
        onSubmit={handleStoreFormSubmit}
        isSubmitting={isSubmittingStore}
      />

      {/* Store QR Code Generator & Download Modal */}
      <StoreQrModal
        isOpen={Boolean(selectedStoreForQr)}
        store={selectedStoreForQr}
        qrUrl={assignedQrUrl}
        onUrlChange={setAssignedQrUrl}
        onSave={handleSaveAssignedQr}
        onClose={() => setSelectedStoreForQr(null)}
        isSaving={isSavingQr}
        saveMsg={qrSaveMsg}
      />

      {/* SuperAdmin / Admin Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        totalMalls={1}
        activeLicenses={storeCounts["Active Counters"]}
        onSignOut={() => {
          localStorage.clear();
          navigate("/");
        }}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} role="admin" />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default BrandDashboard2;
