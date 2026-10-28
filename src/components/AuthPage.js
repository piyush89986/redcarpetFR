import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[#f8fafc] w-full flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] selection:bg-[#e5fc73] selection:text-[#111]">
      <div className="w-full max-w-[380px] bg-white border border-gray-200/80 rounded-3xl shadow-sm sm:shadow-lg p-6 sm:p-8">
        {/* Clean Red Carpet Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/60 text-red-600 text-[11px] font-black uppercase tracking-[0.2em] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>RED CARPET</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight m-0">
            Sign In
          </h1>
          <p className="text-xs text-gray-500 mt-1 m-0">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Compact Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                placeholder="name@redcarpet.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgotpassword")}
                className="text-[11px] font-bold text-gray-500 hover:text-black cursor-pointer transition-colors"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Portal"}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
