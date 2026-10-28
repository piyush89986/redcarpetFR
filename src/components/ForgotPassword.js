import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck, Lock, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import API_BASE from "../apiConfig";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("superadmin");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleCheckUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/check-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      if (!response.ok) {
        throw new Error(`User not found or role mismatch.`);
      }

      const data = await response.json();
      setMessage(data.message || "User verified. Enter your new password.");
      setStep(2);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "User not found or server issue!");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role, newPassword, confirmPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully! Please sign in with your new password.");
        navigate("/");
      } else {
        setIsError(true);
        setMessage(data.message || "Failed to update password.");
      }
    } catch (error) {
      setIsError(true);
      setMessage("Error resetting password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] text-[#141619] relative overflow-hidden selection:bg-[#e5fc73] selection:text-[#111]">
      {/* Luxury Backdrop Watermark */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 -left-6 text-7xl sm:text-8xl lg:text-9xl font-black tracking-[0.25em] text-red-600/[0.04] select-none pointer-events-none uppercase -z-0 whitespace-nowrap"
      >
        REDCARPET
      </div>

      <div className="relative z-10 w-full max-w-md bg-white border border-gray-200/90 rounded-[32px] p-8 sm:p-10 shadow-xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black mb-6 cursor-pointer transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-900 mb-4 shadow-2xs">
          <KeyRound size={22} />
        </div>

        <h2 className="text-2xl font-black text-gray-950 tracking-tight m-0 mb-1">
          {step === 1 ? "Forgot Password" : "Set New Password"}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          {step === 1
            ? "Enter your verified account email and select your portal role."
            : "Choose a strong new password for your account."}
        </p>

        {message && (
          <div
            className={`mb-5 p-3.5 rounded-2xl text-xs font-semibold ${
              isError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckUser} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="admin@redcarpet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Portal Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-semibold outline-none transition-all cursor-pointer"
              >
                <option value="superadmin">SuperAdmin</option>
                <option value="admin">Mall Admin</option>
                <option value="shop admin">Store Counter Staff</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Verifying..." : "Verify Account"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Updating..." : "Update Password"}</span>
              <ShieldCheck size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
