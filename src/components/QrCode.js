import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  QrCode,
  ArrowLeft,
  Building2,
  Store,
  ChevronDown,
  Search,
  Copy,
  Check,
  Download,
  Save,
  Printer,
  Sparkles
} from "lucide-react";
import API_BASE from "../apiConfig";

// Reusable Components
import DockSidebar from "./dashboard/DockSidebar";
import ProfileModal from "./dashboard/ProfileModal";
import HelpModal from "./dashboard/HelpModal";
import Toast from "./dashboard/Toast";

const QRGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [shopsData, setShopsData] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [text, setText] = useState("");
  const [size, setSize] = useState(240);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [copied, setCopied] = useState(false);

  // Layout states
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const qrRef = useRef(null);
  const dropdownRef = useRef(null);

  const userRole = (localStorage.getItem("role") || "admin").toLowerCase().trim();
  const userShopId = localStorage.getItem("shopId") || "";

  // Toast feedback helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Build flattened list of targets (Malls + Individual Stores)
  const allTargets = useMemo(() => {
    const targets = [];
    shopsData.forEach((mall) => {
      const isMallForAdmin = !userShopId || mall._id === userShopId || userRole === "superadmin";

      if (mall.title && isMallForAdmin) {
        targets.push({
          id: mall._id,
          name: mall.title,
          type: "mall",
          category: "Mall Central Counter",
          mallName: mall.title,
          image: mall.image,
          description: mall.description || `Mall ID: ${mall._id}`,
        });

        if (Array.isArray(mall.menuItems)) {
          mall.menuItems.forEach((store) => {
            if (store._id && store.name) {
              targets.push({
                id: store._id,
                name: store.name,
                type: "shop",
                category: `Shop in ${mall.title}`,
                mallName: mall.title,
                mallId: mall._id,
                image: store.image || mall.image,
                description: store.description || `Store inside ${mall.title}`,
              });
            }
          });
        }
      }
    });
    return targets;
  }, [shopsData, userRole, userShopId]);

  const BASE_QR_URL = useMemo(() => {
    return (
      process.env.REACT_APP_FRONTEND_URL ||
      (typeof window !== "undefined" && window.location.origin && !window.location.origin.includes("localhost")
        ? window.location.origin
        : "https://redcarpet-fr.vercel.app")
    );
  }, []);

  // Load a target's saved QR settings from DB
  const loadTargetQR = useCallback(
    async (targetId) => {
      if (!targetId) return;
      setSelectedTargetId(targetId);
      setIsDropdownOpen(false);
      setSaveSuccessMsg("");
      setSaveErrorMsg("");

      const found = allTargets.find((t) => t.id === targetId);
      const defaultUrl = `${BASE_QR_URL}/${targetId}`;

      try {
        const res = await axios.get(`${API_BASE}/api/qrcode/${targetId}`);
        if (res.data?.success && res.data.data?.qrUrl) {
          let url = res.data.data.qrUrl;
          if (
            url.includes("localhost") ||
            url.includes("127.0.0.1")
          ) {
            url = defaultUrl;
          }
          setText(url);
          setSize(res.data.data.size || 240);
          setIsSaved(true);
        } else {
          setText(defaultUrl);
          setSize(240);
          setIsSaved(true);
        }
      } catch (err) {
        setText(defaultUrl);
        setSize(240);
        setIsSaved(true);
      }
    },
    [allTargets, BASE_QR_URL]
  );

  // Fetch all malls on mount
  useEffect(() => {
    axios
      .get(`${API_BASE}/api/shops`)
      .then((res) => {
        setShopsData(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching shops for QR:", err);
      });
  }, []);

  // Handle URL query parameters or auto-select first target
  useEffect(() => {
    if (allTargets.length > 0 && !selectedTargetId) {
      const searchParams = new URLSearchParams(location.search);
      const queryShopId = searchParams.get("shopId") || searchParams.get("mallId");

      if (queryShopId && allTargets.some((t) => t.id === queryShopId)) {
        loadTargetQR(queryShopId);
      } else if (allTargets.length > 0) {
        loadTargetQR(allTargets[0].id);
      }
    }
  }, [allTargets, selectedTargetId, location.search, loadTargetQR]);

  const selectedTarget = useMemo(() => {
    return allTargets.find((t) => t.id === selectedTargetId) || null;
  }, [allTargets, selectedTargetId]);

  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) return allTargets;
    const q = searchQuery.toLowerCase();
    return allTargets.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.mallName?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [allTargets, searchQuery]);

  // Handle Text URL Change
  const handleTextChange = (e) => {
    setText(e.target.value);
    setIsSaved(false);
  };

  // Save to DB
  const handleSaveToDB = async () => {
    if (!selectedTargetId) {
      alert("Please select a store or mall first.");
      return;
    }
    setIsSaving(true);
    setSaveSuccessMsg("");
    setSaveErrorMsg("");

    try {
      await axios.post(`${API_BASE}/api/qrcode/${selectedTargetId}`, {
        qrUrl: text.trim(),
        size: Number(size),
      });
      setIsSaved(true);
      setSaveSuccessMsg(`QR Code saved for ${selectedTarget?.name || "Target"}!`);
      showToast("QR code saved to database!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Error saving QR:", err);
      setSaveErrorMsg("Failed to save QR code. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Link
  const handleCopyLink = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("QR Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Download High-Res PNG
  const handleDownload = () => {
    const canvas = qrRef.current ? qrRef.current.querySelector("canvas") : null;
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    const targetName = (selectedTarget?.name || "redcarpet").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `${targetName}-qr-pass.png`;
    a.click();
    showToast("Downloaded QR Code PNG!");
  };

  return (
    <div className="min-h-screen bg-white w-full py-2 sm:py-3 lg:py-4 pr-4 sm:pr-6 lg:pr-8 pl-4 pt-14 md:pt-3.5 md:pl-[100px] lg:pl-[108px] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] box-border selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Floating Left Dock Navigation */}
      <DockSidebar
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed((prev) => !prev)}
        activeItem="qr"
        onNavigateHome={() => navigate(userShopId ? `/branddashboard2/${userShopId}` : "/branddashboard2")}
        onNavigateQrStudio={() => {}}
        onNavigateStoreDirectors={() => navigate(userShopId ? `/branddashboard2/${userShopId}` : "/branddashboard2")}
        onNavigateAnalytics={() => navigate("/analytics")}
        onCloudClick={() => navigate("/analytics")}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />

      {/* Main Full-Screen Canvas */}
      <main className="flex-1 flex flex-col gap-3 sm:gap-4 min-w-0 w-full max-w-6xl mx-auto">
        {/* Luxury Header Area with REDCARPET Backdrop Watermark */}
        <header className="relative overflow-hidden pt-0 pb-0.5">
          <div
            aria-hidden="true"
            className="absolute -top-7 -left-2 text-6xl sm:text-7xl lg:text-[76px] font-black tracking-[0.25em] text-red-600/[0.05] select-none pointer-events-none uppercase -z-10 whitespace-nowrap leading-none"
          >
            REDCARPET
          </div>

          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (userRole === "superadmin") {
                  navigate("/ownerdashboard");
                } else if (userShopId) {
                  navigate(`/branddashboard2/${userShopId}`);
                } else {
                  navigate("/");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-[#e5fc73] text-gray-800 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={12} strokeWidth={2.8} />
              <span>Back to Dashboard</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-600/20 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>OFFICIAL QR STUDIO</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#141619] leading-tight m-0">
              Store &amp; Mall QR Studio
            </h1>
            <p className="text-xs text-gray-500 m-0">
              Printable customer QR passes for self-service digital queue tokens.
            </p>
          </div>
        </header>

        {/* Studio Content Grid: Configuration Form & Live Preview Standee */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          {/* Left Column: Target Selector & Settings (7 cols) */}
          <div className="lg:col-span-7 bg-[#fafbfb] border border-gray-200/80 rounded-[24px] p-4 sm:p-5 flex flex-col gap-3.5 shadow-xs">
            {/* Target Selector Dropdown */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  Select Shopping Mall or Store Counter *
                </label>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isSaved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {isSaved ? "● Saved in Cloud" : "● Unsaved Changes"}
                </span>
              </div>

              {/* Custom Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="w-full bg-white border border-gray-300 hover:border-black rounded-2xl p-3 flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {selectedTarget?.image ? (
                        <img
                          src={selectedTarget.image}
                          alt={selectedTarget.name}
                          className="w-full h-full object-cover"
                        />
                      ) : selectedTarget?.type === "mall" ? (
                        <Building2 size={18} className="text-gray-600" />
                      ) : (
                        <Store size={18} className="text-gray-600" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate">
                        {selectedTarget ? selectedTarget.name : "-- Choose a Target --"}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {selectedTarget ? selectedTarget.category : "Click to select a store or complex"}
                      </div>
                    </div>
                  </div>

                  <ChevronDown
                    size={17}
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                      isDropdownOpen ? "rotate-180 text-black" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu Popup */}
                {isDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 max-h-72 overflow-hidden flex flex-col">
                    {/* Search inside dropdown */}
                    <div className="relative mb-2 shrink-0">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search mall or brand..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black"
                      />
                    </div>

                    {/* Target Items List */}
                    <div className="overflow-y-auto space-y-1 pr-1 flex-1">
                      {filteredTargets.length > 0 ? (
                        filteredTargets.map((target) => (
                          <button
                            key={target.id}
                            type="button"
                            onClick={() => loadTargetQR(target.id)}
                            className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                              selectedTargetId === target.id
                                ? "bg-[#e5fc73] text-black font-semibold"
                                : "hover:bg-gray-100 text-gray-800"
                            }`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center shrink-0">
                              {target.type === "mall" ? <Building2 size={13} /> : <Store size={13} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold truncate">{target.name}</div>
                              <div className="text-[10px] text-gray-500 truncate">{target.category}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="py-4 text-center text-xs text-gray-400">
                          No matching targets found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Destination Link */}
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1.5">
                Pass Destination URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={handleTextChange}
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:border-black outline-none font-mono transition-colors bg-white"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1 m-0">
                When customers scan the QR, this URL will open their live VIP queue pass.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200/80 flex-wrap">
              <button
                type="button"
                onClick={handleSaveToDB}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#111] hover:bg-gray-800 text-white inline-flex items-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                <span>{isSaving ? "Saving..." : "Save to Cloud"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 inline-flex items-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <Download size={14} />
                <span>Download PNG</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                {saveSuccessMsg}
              </div>
            )}
            {saveErrorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-semibold">
                {saveErrorMsg}
              </div>
            )}
          </div>

          {/* Right Column: Live Printable Standee Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-[24px] p-4 sm:p-5 shadow-md flex flex-col items-center text-center relative overflow-hidden">
              {/* Standee Branding Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-700 text-[10px] font-black uppercase tracking-wider border border-red-600/20 mb-2">
                <Sparkles size={11} className="text-red-600" />
                <span>OFFICIAL QUEUE STANDEE</span>
              </div>

              {/* Target Name */}
              <h3 className="text-base font-black text-gray-900 m-0 mb-0.5 max-w-xs truncate">
                {selectedTarget?.name || "RedCarpet Pass"}
              </h3>
              <p className="text-xs text-gray-500 m-0 mb-2.5 max-w-xs truncate">
                {selectedTarget?.mallName || "Shopping Complex"}
              </p>

              {/* High-Resolution QR Canvas */}
              <div className="p-2.5 bg-white rounded-2xl border-2 border-[#141619] shadow-sm mb-2.5">
                <div ref={qrRef}>
                  <QRCodeCanvas
                    value={text || "https://redcarpet.com"}
                    size={175}
                    level="H"
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
              </div>

              <div className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-0.5">
                Scan with Camera
              </div>
              <div className="text-[10px] text-gray-400 max-w-xs">
                To join the VIP queue &amp; track live counter token
              </div>

              {/* Print Standee Action */}
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-3 w-full py-2 rounded-full bg-gray-100 hover:bg-black hover:text-white text-gray-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Printer size={13} />
                <span>Print Counter Standee</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SuperAdmin / Admin Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        totalMalls={shopsData.length}
        activeLicenses={shopsData.length}
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

export default QRGenerator;