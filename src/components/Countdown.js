import React, { useState, useEffect, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Tv,
  Bell
} from "lucide-react";
import API_BASE from "../apiConfig";

let socket;

// Play pleasant dual-tone chime (Airport/Station chime: E5 -> G#5)
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Note 1: 659.25 Hz (E5)
    osc1.frequency.setValueAtTime(659.25, now);
    // Note 2: 830.61 Hz (G#5)
    osc2.frequency.setValueAtTime(830.61, now + 0.18);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn("Audio chime prevented by browser autoplay policy:", err);
  }
};

const Countdown = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentToken, setCurrentToken] = useState("");
  const [currentGuestName, setCurrentGuestName] = useState("");
  const [storeInfo, setStoreInfo] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [progress, setProgress] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch store and queue details
  const fetchQueueAndStore = useCallback(async () => {
    if (!id) return;
    try {
      // 1. Fetch active queue tokens
      const queueRes = await fetch(`${API_BASE}/api/get-data/${id}`);
      if (queueRes.ok) {
        const tokens = await queueRes.json();
        setQueueList(tokens || []);
        // If no token selected yet, pick the first active token
        if (!currentToken && tokens && tokens.length > 0) {
          const called = tokens.find((t) => t.clicked);
          const firstWaiting = tokens.find((t) => !t.clicked);
          const active = called || firstWaiting || tokens[0];
          if (active) {
            setCurrentToken(String(active.token || ""));
            setCurrentGuestName(active.name || "Valued Guest");
          }
        }
      }

      // 2. Fetch Store / Mall Info
      const shopRes = await fetch(`${API_BASE}/api/shops/${id}`);
      if (shopRes.ok) {
        const sData = await shopRes.json();
        setStoreInfo(sData);
      }
    } catch (err) {
      console.error("Error fetching TV queue data:", err);
    }
  }, [id, currentToken]);

  const startCountdown = useCallback((startTime, duration, tokenNum, guestName, storeTitle) => {
    if (tokenNum) setCurrentToken(String(tokenNum));
    if (guestName) setCurrentGuestName(guestName);
    if (storeTitle && !storeInfo) setStoreInfo((prev) => ({ ...prev, name: storeTitle }));

    setShowMessage(false);
    const safeDuration = Number(duration) || 180;
    const endTime = startTime + safeDuration * 1000;

    const remainingNow = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(remainingNow);

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      const percentageFilled = ((safeDuration - remaining) / safeDuration) * 100;
      setProgress(percentageFilled);

      if (remaining === 0) {
        clearInterval(interval);
        setTimeout(() => setShowMessage(true), 800);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [storeInfo]);

  // Initial Data & WebSocket listeners
  useEffect(() => {
    fetchQueueAndStore();

    // Fetch initial countdown state
    const countdownUrl = id
      ? `${API_BASE}/api/get-countdown?shopId=${id}`
      : `${API_BASE}/api/get-countdown`;

    fetch(countdownUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.startTime) {
          if (data.token) setCurrentToken(String(data.token));
          if (data.name) setCurrentGuestName(data.name);
          startCountdown(
            data.startTime,
            data.duration || 180,
            data.token,
            data.name,
            data.storeName
          );
        }
      })
      .catch((err) => console.error("Error fetching countdown:", err));

    // Connect socket
    if (!socket) {
      socket = io(API_BASE, { transports: ["websocket", "polling"] });
    }

    socket.on("countdown-start", (payload) => {
      if (!id || !payload.shopId || String(payload.shopId) === String(id)) {
        if (soundEnabled) playChime();
        startCountdown(
          payload.startTime,
          payload.duration || 180,
          payload.token,
          payload.name,
          payload.storeName
        );
        fetchQueueAndStore();
      }
    });

    return () => {
      if (socket) socket.off("countdown-start");
    };
  }, [id, soundEnabled, fetchQueueAndStore, startCountdown]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Next waiting tokens list
  const nextInLine = useMemo(() => {
    return queueList
      .filter((q) => !q.clicked && String(q.token) !== String(currentToken))
      .slice(0, 5);
  }, [queueList, currentToken]);

  const venueTitle =
    storeInfo?.title ||
    storeInfo?.name ||
    "Store Counter";

  return (
    <div className="min-h-screen bg-[#101114] text-white w-full flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Luxury REDCARPET Backdrop Branding Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[18vw] font-black tracking-[0.25em] text-white/[0.025] select-none pointer-events-none uppercase -z-0 whitespace-nowrap leading-none"
      >
        REDCARPET
      </div>

      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#e5fc73]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar: TV Screen Title & Quick Controls */}
      <header className="relative z-10 w-full max-w-5xl flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-[#e5fc73]">
            <Tv size={20} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-400">
                LIVE TV QUEUE BROADCAST
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white m-0 truncate max-w-[260px] sm:max-w-md">
              {venueTitle}
            </h2>
          </div>
        </div>

        {/* Audio & Fullscreen Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? "Mute Chime" : "Enable Chime"}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle TV Fullscreen"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Back"
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Center Stage: Token Display & Countdown */}
      <main className="relative z-10 w-full max-w-3xl my-auto py-6 sm:py-8 flex flex-col items-center text-center">
        {/* Live Serving Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e5fc73]/15 text-[#e5fc73] border border-[#e5fc73]/30 text-xs sm:text-sm font-black uppercase tracking-[0.2em] shadow-lg mb-4 animate-in fade-in duration-300">
          <Bell size={14} className="animate-bounce" />
          <span>NOW CALLING / SERVING</span>
        </div>

        {/* HERO TOKEN NUMBER */}
        <div className="my-2 sm:my-3">
          <div className="text-7xl sm:text-9xl lg:text-[140px] font-black tracking-tight font-mono text-[#e5fc73] drop-shadow-[0_0_45px_rgba(229,252,115,0.45)] leading-none select-none">
            {currentToken ? `#${currentToken}` : "#101"}
          </div>
          <p className="text-base sm:text-xl font-bold text-white mt-3 sm:mt-4 m-0 tracking-wide">
            {currentGuestName ? currentGuestName : "Valued Guest"}
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 m-0">
            Please proceed to the counter to collect your order / service
          </p>
        </div>

        {/* Circular Countdown Window */}
        {!showMessage ? (
          <div className="mt-6 sm:mt-8 flex flex-col items-center">
            <div
              className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2.5 transition-all duration-1000 shadow-[0_0_45px_rgba(229,252,115,0.18)]"
              style={{
                background: `conic-gradient(#e5fc73 ${progress * 3.6}deg, rgba(255, 255, 255, 0.08) 0deg)`,
              }}
            >
              <div className="w-full h-full bg-[#16171b] rounded-full flex flex-col items-center justify-center border border-white/10">
                <span className="text-3xl sm:text-4xl font-black text-[#e5fc73] font-mono tracking-tight">
                  {formattedTime}
                </span>
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  Window Remaining
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 py-6 px-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <CheckCircle2 size={48} className="text-[#e5fc73] mx-auto mb-2" />
            <h3 className="text-lg font-bold text-white m-0">Dispatch Window Concluded</h3>
            <p className="text-xs text-gray-400 mt-1 m-0">Next guest token will be announced shortly</p>
          </div>
        )}
      </main>

      {/* Bottom Bar: Next In Line Upcoming Ticker */}
      <footer className="relative z-10 w-full max-w-5xl pt-4 border-t border-white/10 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            <Users size={15} className="text-[#e5fc73]" />
            <span>Next In Line:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {nextInLine.length > 0 ? (
              nextInLine.map((guest, idx) => (
                <div
                  key={guest._id || idx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#e5fc73]/40 transition-colors"
                >
                  <span className="font-mono text-xs font-black text-[#e5fc73]">
                    #{guest.token}
                  </span>
                  <span className="text-xs text-gray-300 font-medium truncate max-w-[120px]">
                    {guest.name || "Guest"}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-500 italic">
                Queue is clear. Walk-in guests can scan QR to join.
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Countdown;
