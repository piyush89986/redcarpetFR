import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Sparkles, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import API_BASE from "../apiConfig";

const socket = io(API_BASE);

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(180);
  const [progress, setProgress] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/get-countdown`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.startTime) {
          startCountdown(data.startTime, data.duration || 180);
        }
      })
      .catch((err) => console.error("Error fetching countdown:", err));

    socket.on("countdown-start", ({ startTime, duration }) => {
      startCountdown(startTime, duration || 180);
    });

    return () => socket.off("countdown-start");
  }, []);

  const startCountdown = (startTime, duration) => {
    const endTime = startTime + duration * 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      const percentageFilled = ((duration - remaining) / duration) * 100;
      setProgress(percentageFilled);

      if (remaining === 0) {
        clearInterval(interval);
        setTimeout(() => setShowMessage(true), 1200);
      }
    }, 1000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#121316] text-white w-full flex flex-col items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Luxury REDCARPET Backdrop Branding Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 -left-6 text-7xl sm:text-8xl lg:text-9xl font-black tracking-[0.25em] text-white/[0.03] select-none pointer-events-none uppercase -z-0 whitespace-nowrap"
      >
        REDCARPET
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-xl rounded-[36px] p-8 sm:p-12 text-center shadow-2xl">
        {/* Brand Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 text-red-400 text-xs font-black uppercase tracking-wider border border-red-600/25 shadow-2xs mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>LIVE DISPATCH CALL</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight m-0 mb-3">
          {showMessage ? "Your Turn Is Complete" : "Please Proceed to Counter"}
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm mx-auto mb-8">
          {showMessage
            ? "Thank you for visiting RedCarpet. Have a wonderful day!"
            : "Your token has been called on screen. Please approach your counter during this window:"}
        </p>

        {/* Circular Timer Ring */}
        {!showMessage ? (
          <div
            className="relative w-56 h-56 mx-auto mb-8 flex items-center justify-center rounded-full p-2.5 transition-all duration-1000 shadow-[0_0_40px_rgba(229,252,115,0.15)]"
            style={{
              background: `conic-gradient(#e5fc73 ${progress * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`,
            }}
          >
            <div className="w-full h-full bg-[#18191d] rounded-full flex flex-col items-center justify-center border border-white/10">
              <span className="text-5xl font-black text-[#e5fc73] tracking-tight font-mono">
                {formattedTime}
              </span>
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                Minutes : Seconds
              </span>
            </div>
          </div>
        ) : (
          <div className="py-10">
            <CheckCircle2 size={64} className="text-[#e5fc73] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Order Dispatched Successfully</h3>
            <p className="text-xs text-gray-400">Thank you for visiting.</p>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white/10 hover:bg-white hover:text-black text-white border border-white/15 transition-all duration-200 cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Return to VIP Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
