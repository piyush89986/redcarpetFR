import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Store,
  Ticket
} from "lucide-react";
import API_BASE from "../apiConfig";

function Token() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(
    localStorage.getItem("queueToken") || null
  );
  const [loading, setLoading] = useState(!token);
  const [shopDetails, setShopDetails] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE}/api/shops/${id}`)
      .then((res) => setShopDetails(res.data))
      .catch((err) => console.log("Shop detail notice:", err.message));
  }, [id]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const phone = localStorage.getItem("phone");
        const apiBase = API_BASE;
        const response = await axios.get(`${apiBase}/api/get-token?phone=${phone}`);
        if (response.data?.token) {
          setToken(response.data.token);
          localStorage.setItem("queueToken", String(response.data.token));
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      fetchToken();
    }
  }, [token]);

  const targetName = shopDetails?.title || shopDetails?.name || "Red Carpet VIP";
  const guestName = localStorage.getItem("userName") || "Valued Guest";
  const guestPhone = localStorage.getItem("phone") || "";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#141619] flex flex-col justify-between items-center px-4 py-3 sm:py-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
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

      {/* Top Brand Tag */}
      <header className="w-full max-w-md flex items-center justify-between mb-2.5 sm:mb-3 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>VIP ACCESS GRANTED</span>
        </div>

        <div className="text-xs font-bold text-gray-400 font-mono">
          PASS ID #{token || "001"}
        </div>
      </header>

      {/* Digital Boarding Ticket / VIP Passcard */}
      <main className="w-full max-w-md bg-white border border-gray-200/90 rounded-[28px] p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.08)] relative z-10 flex flex-col text-center">
        {/* Pass Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-bold mb-2">
            <Store size={13} className="text-black" />
            <span>{targetName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight leading-tight m-0 mb-1">
            Your Priority Pass is Ready
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto m-0">
            Please keep this token visible when approaching the billing counter.
          </p>
        </div>

        {/* Central Glowing Token Orb */}
        <div className="my-5 relative flex items-center justify-center">
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-[#121316] via-[#1a1b20] to-[#121316] text-white flex flex-col items-center justify-center shadow-xl border-4 border-[#e5fc73] relative group">
            {/* Ambient Pulsing Glow */}
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-full bg-[#e5fc73]/20 blur-md -z-10 animate-pulse"
            />

            <span className="text-[11px] font-black uppercase tracking-widest text-[#e5fc73] mb-0.5">
              TOKEN NO.
            </span>
            <span className="text-5xl font-black font-mono tracking-tight text-white leading-none">
              {loading ? "..." : token ? `#${token}` : "#1"}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
              Express Lane
            </span>
          </div>
        </div>

        {/* Guest Metadata Card */}
        <div className="w-full grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#fafbfb] border border-gray-200/70 text-left mb-5">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Guest Name</div>
            <div className="text-xs font-bold text-gray-900 truncate">{guestName}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Queue Status</div>
            <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active in Line</span>
            </div>
          </div>
        </div>

        {/* SMS Notification Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-left flex items-start gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <Bell size={16} strokeWidth={2.4} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-900">SMS Notification Active</div>
            <div className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              We'll send an automatic SMS alert to <strong className="font-mono">+91 {guestPhone}</strong> when your counter slot is approaching!
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => navigate(`/${id}/countdown`)}
          className="w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer group"
        >
          <Clock size={16} className="text-[#e5fc73]" />
          <span>Open Live Service Countdown</span>
          <ArrowRight
            size={16}
            strokeWidth={2.5}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-gray-400 font-medium">
        Powered by <strong className="text-gray-700">Red Carpet VIP Concierge</strong>
      </footer>
    </div>
  );
}

export default Token;
