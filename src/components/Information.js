import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles
} from "lucide-react";
import API_BASE from "../apiConfig";

function Information() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mall, setMall] = useState(null);
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [mobile, setMobile] = useState(localStorage.getItem("phone") || "");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const apiBase = API_BASE;

  // Fetch Mall Details
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => setMall(res.data))
      .catch((err) => console.log("Mall info notice:", err.message));

    // Persist real-time QR scan event in analytics database
    axios
      .post(`${apiBase}/api/analytics/track-scan`, { shopId: id, scanType: "page_view" })
      .catch(() => {});
  }, [id, apiBase]);

  // Direct Registration (No SMS OTP verification block)
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const cleanEmail = email.trim();

    if (mall?.subscriptionStatus === "inactive") {
      setErrorMsg("Platform subscription for this location is paused. Please contact administration.");
      return;
    }

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanEmail && !emailPattern.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Save user into queue with backend-assigned token
      const { data: infoData } = await axios.post(`${apiBase}/api/information`, {
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
        shopid: id,
      });

      const assignedToken = infoData?.token || infoData?.newInfo?.token || "1";
      const userId = infoData?.newInfo?._id || "";
      localStorage.setItem("queueToken", String(assignedToken));
      localStorage.setItem("phone", cleanMobile);
      localStorage.setItem("userName", cleanName);
      localStorage.setItem("userEmail", cleanEmail);

      navigate(`/${id}/paymentpage?userId=${userId}`);
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMsg(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const storeTitle = mall?.title || mall?.name || "VIP Concierge";

  return (
    <div className="min-h-screen bg-white sm:bg-[#f8fafc] text-[#141619] flex flex-col justify-between items-center px-4 py-4 sm:py-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Luxury Backdrop Glows (Desktop only) */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-red-600/[0.07] blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#e5fc73]/30 blur-3xl pointer-events-none"
      />

      {/* REDCARPET Luxury Backdrop Watermark */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-7xl sm:text-8xl md:text-9xl font-black tracking-[0.28em] text-gray-900/[0.025] select-none pointer-events-none uppercase -z-0 whitespace-nowrap"
      >
        REDCARPET
      </div>

      {/* Top Navbar / Brand Identity */}
      <header className="w-full max-w-md flex items-center justify-between mb-4 sm:mb-5 z-10">
        <button
          type="button"
          onClick={() => navigate(`/${id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft size={12} strokeWidth={2.8} />
          <span>Store</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold">
          <Sparkles size={12} className="text-amber-500" />
          <span>VIP REGISTRATION</span>
        </div>
      </header>

      {/* Main Content: Flat on Mobile, Card on Desktop */}
      <main className="w-full max-w-md bg-transparent sm:bg-white border-0 sm:border border-gray-200/80 rounded-none sm:rounded-[28px] p-0 sm:p-7 shadow-none sm:shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 flex flex-col">
        {/* Header & Title */}
        <div className="text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-tight m-0 mb-1">
            {storeTitle}
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto m-0">
            Enter your details below to generate your live digital priority pass.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Customer Information Form - Directly Shown */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50/70 sm:bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Mobile Number (For SMS Queue Pass) *
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center justify-center px-3 py-2.5 sm:py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-xs sm:text-sm font-bold text-gray-700 select-none">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                required
                className="w-full px-3.5 py-2.5 sm:py-3 bg-gray-50/70 sm:bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-r-xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400 font-mono"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Email Address <span className="text-gray-400 font-normal normal-case">(Optional)</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50/70 sm:bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Sleek Capsule Submit Button */}
          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[220px] py-2.5 sm:py-3 px-6 sm:px-8 bg-[#111215] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Generating Queue Pass..." : "Get Priority Queue Pass"}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-semibold">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Instant queue generation • Data strictly confidential</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-gray-400 font-medium">
        Powered by <strong className="text-gray-700">Red Carpet VIP Concierge</strong>
      </footer>
    </div>
  );
}

export default Information;
