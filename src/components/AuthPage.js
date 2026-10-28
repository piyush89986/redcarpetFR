import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, Building2, Store } from "lucide-react";
import API_BASE from "../apiConfig";
import { useAppDispatch, setCredentials } from "../redux";

const AuthPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const shopId = localStorage.getItem("shopId");

    if (token) {
      const cleanRole = (role || "").toLowerCase().trim();
      if (cleanRole === "superadmin") {
        navigate("/ownerdashboard", { replace: true });
      } else if (cleanRole === "admin" && shopId) {
        navigate(`/branddashboard2/${shopId}`, { replace: true });
      } else if (
        (cleanRole === "shop admin" || cleanRole === "shopadmin" || cleanRole === "shop") &&
        shopId
      ) {
        navigate(`/${shopId}/counter`, { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const userRole = (res.data.role || res.data.user?.role || "admin").toLowerCase().trim();
      const userShopId = res.data.shopId || "";

      // Update Redux Store
      dispatch(
        setCredentials({
          token: res.data.token,
          role: userRole,
          shopId: userShopId,
          user: res.data.user || null,
        })
      );

      if (userRole === "superadmin") {
        navigate("/ownerdashboard");
      } else if (userRole === "admin") {
        navigate(`/branddashboard2/${userShopId}`);
      } else if (
        userRole === "shop admin" ||
        userRole === "shopadmin" ||
        userRole === "shop"
      ) {
        navigate(`/${userShopId}/counter`);
      } else {
        navigate(`/branddashboard2/${userShopId}`);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Invalid email or password. Please verify your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (eMail, pass) => {
    setEmail(eMail);
    setPassword(pass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-white w-full flex flex-col lg:flex-row font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Left Brand Showcase Panel (Desktop) */}
      <div className="lg:w-1/2 bg-[#121316] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden shrink-0">
        {/* Luxury Background Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#e5fc73]/10 blur-3xl pointer-events-none"
        />

        {/* Large REDCARPET Backdrop Branding Watermark */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 -left-6 text-7xl sm:text-8xl lg:text-9xl font-black tracking-[0.25em] text-white/[0.03] select-none pointer-events-none uppercase -z-0 whitespace-nowrap"
        >
          REDCARPET
        </div>

        {/* Top Brand Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/15 text-red-400 text-xs font-black uppercase tracking-wider border border-red-600/25 shadow-2xs mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>RED CARPET PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Gen Shopping <br />
            <span className="text-[#e5fc73]">Complexes &amp; Queues</span>
          </h1>

          <p className="text-sm text-gray-400 max-w-md mt-4 leading-relaxed">
            Centralized mall operations, live TV queue displays, and isolated brand counter passes built for luxury retail destinations.
          </p>
        </div>

        {/* Bottom Metrics Pill Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3.5 mt-10 pt-8 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Building2 size={14} className="text-[#e5fc73]" />
              <span>Complexes</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">100% Cloud</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Store size={14} className="text-[#e5fc73]" />
              <span>Live Queues</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">&lt; 100ms</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Role Access</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">RBAC 2.0</div>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 bg-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center items-center">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="mb-8 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold uppercase tracking-wider mb-3">
              <Sparkles size={12} className="text-black" />
              <span>PORTAL LOGIN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight m-0">
              Sign In to Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 m-0">
              Enter your authorized credentials to access your portal.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 font-semibold leading-relaxed animate-in fade-in">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@redcarpet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgotpassword")}
                  className="text-xs font-bold text-gray-500 hover:text-black cursor-pointer transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
              Quick One-Click Demo Access
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials("admin@redcarpet.com", "admin123")}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[#e5fc73] text-gray-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                SuperAdmin
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("manager@phoenixmall.com", "password123")}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[#e5fc73] text-gray-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Mall Manager
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials("zara@phoenixmall.com", "password123")}
                className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-[#e5fc73] text-gray-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Store / Shop Counter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
