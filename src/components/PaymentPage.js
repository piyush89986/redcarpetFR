import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  QrCode,
  Bell,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock
} from "lucide-react";
import API_BASE from "../apiConfig";

const PaymentPage = ({ amount = 120 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mall, setMall] = useState(null);

  const apiBase = API_BASE;

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => setMall(res.data))
      .catch((err) => console.log("Mall info notice:", err.message));
  }, [id, apiBase]);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/${id}/token`);
    }, 1200);
  };

  const storeTitle = mall?.title || mall?.name || "VIP Concierge";

  return (
    <div className="min-h-screen bg-white sm:bg-[#f8fafc] text-[#141619] flex flex-col justify-between items-center px-4 py-4 sm:py-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Luxury Backdrop Glows (Desktop only) */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-red-600/[0.07] blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#e5fc73]/30 blur-3xl pointer-events-none"
      />

      {/* REDCARPET Luxury Backdrop Watermark */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-7xl sm:text-8xl md:text-9xl font-black tracking-[0.28em] text-gray-900/[0.025] select-none pointer-events-none uppercase -z-0 whitespace-nowrap"
      >
        REDCARPET
      </div>

      {/* Top Navbar */}
      <header className="w-full max-w-md flex items-center justify-between mb-4 sm:mb-5 z-10">
        <button
          type="button"
          onClick={() => navigate(`/${id}/information`)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft size={12} strokeWidth={2.8} />
          <span>Back</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold">
          <Sparkles size={12} className="text-amber-500" />
          <span>VIP PASS CONFIRMATION</span>
        </div>
      </header>

      {/* Main Content: Flat on Mobile, Card on Desktop */}
      <main className="w-full max-w-md bg-transparent sm:bg-white border-0 sm:border border-gray-200/80 rounded-none sm:rounded-[28px] p-0 sm:p-7 shadow-none sm:shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 flex flex-col">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-tight m-0 mb-1">
            {storeTitle}
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto m-0">
            Confirm your priority reservation to generate your official queue pass.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="flex flex-col gap-2.5 mb-6">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#fafbfb] border border-gray-200/70">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <QrCode size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Digital Queue Token</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Scanned and recognized at all store billing counters</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#fafbfb] border border-gray-200/70">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Bell size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Real-Time SMS Alerts</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Automated notification when your turn approaches</div>
            </div>
          </div>
        </div>

        {/* Price Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121316] to-[#1f2127] text-white text-center shadow-md mb-6 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#e5fc73]/10 blur-xl pointer-events-none"
          />

          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#e5fc73] text-[10px] font-extrabold tracking-widest uppercase mb-2">
            VIP ACCESS TIER
          </span>

          <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
            ₹{mall?.conciergeFee || mall?.fee || amount}
          </div>
          <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mt-1">
            One-Time Concierge Fee
          </div>
          <div className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
            Includes express priority checkout & real-time queue tracking
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handlePayment}
            disabled={loading}
            className="w-full sm:w-auto sm:min-w-[240px] py-2.5 sm:py-3 px-6 sm:px-8 bg-[#111215] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Activating VIP Pass..." : "Confirm & Issue VIP Pass"}</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Security Assurance */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-semibold">
          <Lock size={13} className="text-emerald-500" />
          <span>Instant activation • Direct priority queue integration</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-gray-400 font-medium">
        Powered by <strong className="text-gray-700">Red Carpet VIP Concierge</strong>
      </footer>
    </div>
  );
};

export default PaymentPage;