import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  Zap,
  ShoppingBag,
  Bell,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Store,
  Clock
} from "lucide-react";
import API_BASE from "./apiConfig";

function Explain() {
  const { id } = useParams();
  const [mall, setMall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const apiBase = API_BASE;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => {
        setMall(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Mall fetch notice:", err.message);
        setLoading(false);
      });

    // Persist real-time QR scan event in analytics database
    axios
      .post(`${apiBase}/api/analytics/track-scan`, { shopId: id, scanType: "qr_scan" })
      .catch(() => {});
  }, [id]);

  const storeTitle = mall?.title || mall?.name || "Red Carpet VIP";
  const parentMallTitle = mall?.mallTitle || mall?.complexTitle || null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#141619] flex flex-col justify-between items-center px-4 py-6 sm:py-10 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Luxury Backdrop Glows */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-red-600/[0.07] blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-[#e5fc73]/30 blur-3xl pointer-events-none"
      />

      {/* REDCARPET Luxury Backdrop Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-7xl sm:text-8xl md:text-9xl font-black tracking-[0.28em] text-gray-900/[0.025] select-none pointer-events-none uppercase -z-0 whitespace-nowrap"
      >
        REDCARPET
      </div>

      {/* Top Navbar / Brand Identity */}
      <header className="w-full max-w-md flex items-center justify-between mb-4 sm:mb-6 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#111215] flex items-center justify-center text-white font-black text-xs shadow-sm">
            RC
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-black tracking-wider uppercase text-gray-900 leading-none">
              RED CARPET
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">
              VIP CONCIERGE
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Service</span>
        </div>
      </header>

      {/* Main VIP Welcome Card */}
      <main className="w-full max-w-md bg-white border border-gray-200/80 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 flex flex-col items-center text-center">
        {/* Floating Store Badge */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-[#e5fc73] flex items-center justify-center shadow-lg mb-4 border border-black/10">
          <Store size={28} strokeWidth={2.2} />
        </div>

        {/* Location & Complex Pill */}
        {parentMallTitle && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mb-3">
            <MapPin size={12} className="text-red-500" />
            <span>{parentMallTitle}</span>
          </div>
        )}

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight m-0 mb-2">
          {loading ? "Welcome to Red Carpet" : `Welcome to ${storeTitle}`}
        </h1>

        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs m-0 mb-6">
          Enjoy priority counter access and dedicated concierge shopping. Skip physical checkout lines with your instant digital pass.
        </p>

        {/* Feature Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-7 text-left">
          {/* Feature 1 */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#fafbfb] border border-gray-200/70 hover:border-black/20 transition-all">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Zero Waiting</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Skip billing lines</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#fafbfb] border border-gray-200/70 hover:border-black/20 transition-all">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShoppingBag size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">Priority Cart</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Express checkout</div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 p-3 sm:p-3.5 rounded-2xl bg-[#fafbfb] border border-gray-200/70 hover:border-black/20 transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Bell size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">SMS Alerts</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Live turn updates</div>
            </div>
          </div>
        </div>

        {/* Subscription Paused Notice or CTA */}
        {mall?.subscriptionStatus === "inactive" ? (
          <div className="w-full">
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 mb-3">
              ⚠️ Platform Subscription Notice: Service for this location is paused by administration.
            </div>
            <button
              disabled
              className="w-full py-4 rounded-2xl bg-gray-200 text-gray-500 font-bold text-sm cursor-not-allowed"
            >
              Pass Currently Unavailable
            </button>
          </div>
        ) : (
          <Link
            to={`/${id}/information`}
            className="w-full no-underline"
          >
            <button
              type="button"
              className="w-full py-4 px-6 rounded-2xl bg-[#111215] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer group"
            >
              <span>Get VIP Pass & Cart</span>
              <ArrowRight
                size={16}
                strokeWidth={2.5}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>
        )}

        {/* Quick Micro-Trust Badges */}
        <div className="mt-5 pt-4 border-t border-gray-100 w-full flex items-center justify-center gap-4 text-[11px] text-gray-400 font-semibold">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-500" />
            Instant Activation
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-blue-500" />
            No App Download
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-gray-400 font-medium">
        Powered by <strong className="text-gray-700">Red Carpet VIP Concierge</strong> • Enterprise Retail Infrastructure
      </footer>
    </div>
  );
}

export default Explain;
