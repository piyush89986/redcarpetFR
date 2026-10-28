import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Bell,
  Clock,
  ArrowLeft,
  Tv,
  RefreshCw,
  CheckCircle2,
  MessageSquare,
  Building2,
  Store,
  AlertTriangle,
  QrCode
} from "lucide-react";
import API_BASE from "../apiConfig";
import { useAppDispatch, setQueueData as setReduxQueueData, setShopInfo as setReduxShopInfo } from "../redux";

// Reusable Components
import DockSidebar from "./dashboard/DockSidebar";
import SearchBar from "./dashboard/SearchBar";
import TabsNav from "./dashboard/TabsNav";
import ProfileModal from "./dashboard/ProfileModal";
import HelpModal from "./dashboard/HelpModal";
import Toast from "./dashboard/Toast";

const QUEUE_TABS = ["All Guests", "Waiting in Line", "Called & Served"];

const Counter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [data, setData] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All Guests");

  // Layout & Dock states
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Automation SMS settings
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(
    JSON.parse(localStorage.getItem("autoSmsEnabled") ?? "true")
  );
  const [alertAheadSlots, setAlertAheadSlots] = useState(
    Number(localStorage.getItem("alertAheadSlots") || "2")
  );
  const [smsAlertedMap, setSmsAlertedMap] = useState(
    JSON.parse(localStorage.getItem("smsAlertedMap") || "{}")
  );
  const [lastSmsAlert, setLastSmsAlert] = useState(null);

  const rawRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const userRole = rawRole;
  const storedShopId = localStorage.getItem("shopId");

  // Scroll listener for collapsible header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 40) {
        setIsScrolled(true);
      } else if (currentScrollY < 15) {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  }, []);

  // Scoped Access Control
  useEffect(() => {
    if (!rawRole || !["admin", "superadmin", "shop admin", "shopadmin", "shop"].includes(rawRole)) {
      console.warn("Access Denied: Unauthenticated user attempted to access staff counter queue.");
      navigate("/", { replace: true });
      return;
    }

    if (
      (rawRole === "shop admin" || rawRole === "shopadmin" || rawRole === "shop") &&
      storedShopId &&
      id &&
      id !== storedShopId
    ) {
      console.warn("Access Restricted: Counter staff can only access their assigned store queue.");
      navigate(`/${storedShopId}/counter`, { replace: true });
    }

    if (rawRole === "admin" && storedShopId && shopInfo) {
      const mallId = shopInfo.mallId || shopInfo._id;
      if (mallId && String(mallId) !== String(storedShopId)) {
        console.warn("Access Restricted: Admin can only view live counters within their own mall.");
        navigate(`/branddashboard2/${storedShopId}`, { replace: true });
      }
    }
  }, [rawRole, storedShopId, id, shopInfo, navigate]);

  // Fetch shop details
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE}/api/shops/${id}`)
      .then((res) => {
        setShopInfo(res.data);
        dispatch(setReduxShopInfo(res.data));
      })
      .catch((err) => console.log("Notice: shop info not loaded:", err.message));
  }, [id, dispatch]);

  // Fetch real-time queue data from API
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/get-data/${id}`);
      let fetchedData = response.data || [];

      const savedClickedState =
        JSON.parse(localStorage.getItem("clickedState")) || {};

      fetchedData = fetchedData.map((item) => ({
        ...item,
        clicked: savedClickedState[item._id] || false,
      }));

      setData(fetchedData);
      dispatch(setReduxQueueData(fetchedData));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching queue data:", error);
      setLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Send SMS Message
  const handleSendMessage = async ({ number, name, token, createdAt, alertType, message }) => {
    if (!number) return;
    try {
      const storeName = shopInfo?.title || shopInfo?.name || "Store Counter";
      const mallName = shopInfo?.mallTitle || "";
      const response = await axios.post(`${API_BASE}/api/send-message`, {
        number,
        name,
        token,
        createdAt,
        storeName,
        mallName,
        alertType,
        message,
        shopId: id,
      });
      if (response.data) {
        setLastSmsAlert(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("Error sending SMS alert:", error);
    }
  };

  // Manual SMS Trigger
  const handleSendManualAlert = async (customer) => {
    if (!customer?.mobile) {
      showToast("No mobile number provided for this guest.");
      return;
    }
    const res = await handleSendMessage({
      number: customer.mobile,
      name: customer.name,
      token: customer.token,
      createdAt: customer.createdAt,
      alertType: "approaching",
    });
    const updatedAlertMap = { ...smsAlertedMap, [customer._id]: true };
    setSmsAlertedMap(updatedAlertMap);
    localStorage.setItem("smsAlertedMap", JSON.stringify(updatedAlertMap));
    showToast(`SMS alert sent to ${customer.name || "guest"} (${customer.mobile})`);
  };

  // Filtered queue
  const filteredQueue = useMemo(() => {
    return data.filter((item) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matches =
          item.name?.toLowerCase().includes(query) ||
          item.mobile?.toLowerCase().includes(query) ||
          String(item.token || "").toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (activeTab === "Waiting in Line") return !item.clicked;
      if (activeTab === "Called & Served") return item.clicked;
      return true; // "All Guests"
    });
  }, [data, search, activeTab]);

  const waitingCount = useMemo(() => data.filter((d) => !d.clicked).length, [data]);
  const calledCount = useMemo(() => data.filter((d) => d.clicked).length, [data]);

  const queueCounts = useMemo(() => {
    return {
      "All Guests": data.length,
      "Waiting in Line": waitingCount,
      "Called & Served": calledCount,
    };
  }, [data, waitingCount, calledCount]);

  // If Shop Subscription is Inactive
  if (shopInfo && shopInfo.subscriptionStatus === "inactive") {
    return (
      <div className="min-h-screen bg-white w-full flex items-center justify-center p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#141619]">
        <div className="max-w-md w-full bg-[#fafbfb] border border-red-200/80 rounded-[32px] p-8 sm:p-10 text-center shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <AlertTriangle size={32} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-bold uppercase tracking-wider mb-3">
            Counter Paused
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 m-0 mb-2">
            Subscription Has Expired
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
            Live queue dispatch for <strong>{shopInfo.title || shopInfo.name || "this location"}</strong> is temporarily suspended by platform administration.
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
            className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#111] hover:bg-gray-800 text-white cursor-pointer transition-colors shadow-md"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const backDestination =
    userRole === "superadmin"
      ? shopInfo?.mallId ? `/branddashboard2/${shopInfo.mallId}` : "/ownerdashboard"
      : `/branddashboard2/${storedShopId || shopInfo?.mallId || id}`;

    const isShopStaff =
      userRole === "shop admin" ||
      userRole === "shopadmin" ||
      userRole === "shop";

    return (
    <div className="min-h-screen bg-white w-full py-4 sm:py-6 lg:py-7 pr-4 sm:pr-6 lg:pr-8 pl-4 pt-16 md:pt-5 md:pl-[100px] lg:pl-[108px] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] box-border selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Floating Left Dock Sidebar */}
      <DockSidebar
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
        onAddMall={() => navigate(backDestination)}
        activeItem="home"
        onNavigateHome={() => {
          if (isShopStaff) {
            navigate(`/${storedShopId || id}/counter`);
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else if (userRole === "superadmin") {
            navigate("/ownerdashboard");
          } else {
            navigate(`/branddashboard2/${storedShopId || shopInfo?.mallId || id}`);
          }
        }}
        onNavigateQrStudio={() => navigate(`/qrcode?shopId=${id}`)}
        onNavigateAnalytics={() => navigate("/analytics")}
        onCloudClick={() => navigate("/analytics")}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onSignOut={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("shopId");
          localStorage.removeItem("user");
          navigate("/");
        }}
      />

      {/* Main Full-Screen Canvas */}
      <main className="flex-1 flex flex-col gap-5 sm:gap-6 min-w-0 w-full">
        {/* Luxury Collapsible Header with REDCARPET Backdrop Watermark */}
        <header
          className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled
              ? "max-h-0 opacity-0 -translate-y-4 pointer-events-none mb-0 py-0"
              : "max-h-56 opacity-100 translate-y-0 mb-1 pt-1 pb-1"
          }`}
        >
          {/* Backdrop Watermark */}
          <div
            aria-hidden="true"
            className="absolute -top-7 -left-2 text-6xl sm:text-7xl lg:text-[88px] font-black tracking-[0.25em] text-red-600/[0.05] select-none pointer-events-none uppercase -z-10 whitespace-nowrap leading-none"
          >
            REDCARPET
          </div>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {!isShopStaff && (
              <button
                type="button"
                onClick={() => navigate(backDestination)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-[#e5fc73] text-gray-800 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft size={12} strokeWidth={2.8} />
                <span>Back to Complex</span>
              </button>
            )}

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 text-red-700 text-[11px] font-black uppercase tracking-wider border border-red-600/20 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>LIVE QUEUE DISPATCH</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-[#141619] leading-tight m-0">
            {shopInfo?.title || shopInfo?.name || "Store Counter"}
            <span className="text-gray-400 font-normal text-lg sm:text-xl ml-2">
              • Live Queue
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mt-1 m-0">
            Real-time customer tokens for today. Automatically synchronizes with customer mobile passes and TV countdown screens.
          </p>
        </header>

        {/* Dynamic SMS Notification Banner */}
        {lastSmsAlert && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start justify-between gap-3 shadow-xs">
            <div>
              <div className="font-bold flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>SMS Alert Dispatched</span>
              </div>
              <div className="font-mono text-[11px] bg-white/70 p-2 rounded-lg border border-emerald-100 mt-1">
                "{lastSmsAlert.body || "Alert message rendered"}"
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLastSmsAlert(null)}
              className="text-emerald-700 hover:text-black font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Sticky Controls Row: Tabs Navbar + Automation Pill + Refresh + Search Bar */}
        <div
          className={`sticky top-0 z-30 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 py-2.5 sm:py-3 transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.03)] -mx-2 px-2 sm:-mx-4 sm:px-4"
              : "bg-white border-b border-gray-100"
          }`}
        >
          {/* Horizontal Navbar Tabs */}
          <TabsNav
            tabs={QUEUE_TABS}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              showToast(`Showing: ${tab}`);
            }}
            counts={queueCounts}
          />

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end flex-wrap">
            {/* Auto-SMS Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const next = !autoSmsEnabled;
                setAutoSmsEnabled(next);
                localStorage.setItem("autoSmsEnabled", JSON.stringify(next));
                showToast(`Auto-SMS: ${next ? "Enabled" : "Disabled"}`);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs ${
                autoSmsEnabled
                  ? "bg-[#e5fc73] text-[#111] border border-black/10"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {autoSmsEnabled ? `● Auto-SMS (${alertAheadSlots} Ahead)` : "○ Auto-SMS: OFF"}
            </button>

            {/* Launch TV Screen */}
            <button
              type="button"
              onClick={() => window.open(`/${id}/countdown`, "_blank")}
              title="Launch Live TV Queue Screen in a new tab"
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              <Tv size={13} />
              <span>TV Screen</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => {
                fetchData();
                showToast("Refreshed queue tokens");
              }}
              title="Refresh Queue Tokens"
              className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 border border-[#e7ebe8] flex items-center justify-center text-gray-700 hover:text-black shadow-xs transition-transform duration-200 active:rotate-180 cursor-pointer shrink-0"
            >
              <RefreshCw size={15} className={loading ? "animate-spin text-black" : ""} />
            </button>

            {/* Search Bar */}
            <SearchBar
              value={search}
              onChange={(query) => setSearch(query)}
              placeholder="Search token #, name, mobile..."
            />
          </div>
        </div>

        {/* Live Queue Tokens Table */}
        <section className="flex-1 w-full bg-white border border-gray-200/90 rounded-[24px] overflow-hidden shadow-xs">
          {loading && data.length === 0 ? (
            <div className="py-20 text-center text-sm text-gray-500">
              <RefreshCw size={26} className="animate-spin mx-auto mb-3 text-gray-400" />
              Loading live queue tokens...
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <Users size={36} className="mx-auto mb-2 text-gray-400" />
              <h4 className="text-sm font-bold text-gray-800 m-0">No tokens in this queue</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No guests match "${search}". Try adjusting your keywords.`
                  : "Customers who scan the store's QR pass will automatically appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#fafbfb] border-b border-gray-200/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4"># S.No</th>
                    <th className="py-3 px-4">Token ID</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Mobile Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredQueue.map((item, index) => {
                    const isAlerted = !!smsAlertedMap[item._id];

                    return (
                      <tr
                        key={item._id || index}
                        className="hover:bg-[#fafbfb] transition-colors"
                      >
                        <td className="py-3 px-4 font-semibold text-gray-400">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4 font-bold text-gray-900">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-[#e5fc73]/40 border border-[#e5fc73] text-gray-950 font-mono text-xs font-black">
                            #{item.token || String(index + 1)}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-gray-900">
                          {item.name || "Walk-in Guest"}
                        </td>

                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {item.mobile || "—"}
                        </td>

                        <td className="py-3 px-4">
                          {item.clicked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold text-[11px]">
                              <CheckCircle2 size={12} className="text-gray-500" />
                              Served
                            </span>
                          ) : isAlerted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                              <Bell size={12} className="text-emerald-600" />
                              Alerted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                              <Clock size={12} className="text-blue-600" />
                              Waiting
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSendManualAlert(item)}
                            title="Send template SMS alert to customer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer shadow-2xs"
                          >
                            <MessageSquare size={12} />
                            <span>{isAlerted ? "Re-alert" : "Alert SMS"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* SuperAdmin / Admin Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        totalMalls={1}
        activeLicenses={1}
        onSignOut={() => {
          localStorage.clear();
          navigate("/");
        }}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} role="shop" />

      {/* Floating Toast Notification */}
      <Toast message={toastMessage} />
    </div>
  );
};

export default Counter;
