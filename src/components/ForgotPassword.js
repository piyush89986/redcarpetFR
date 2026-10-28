import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw
} from "lucide-react";
import API_BASE from "../apiConfig";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // State Management
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin"); // Default: Mall Manager ("admin")
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Stepper & UI States
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code.");
      }

      setMessage(data.message || "Verification code sent to your email!");
      setStep(2);
      setResendCooldown(30);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Account not found or server issue.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp.trim()) {
      setIsError(true);
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired code.");
      }

      setMessage(data.message || "Code verified successfully!");
      setStep(3);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();

    if (newPassword.length < 6) {
      setIsError(true);
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch(`${API_BASE}/api/forgot-password/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setStep(4);
      setMessage("Password successfully reset! You can now sign in.");
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Error updating password. Please try again.");
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
            {step === 1 && "Reset Password"}
            {step === 2 && "Enter OTP"}
            {step === 3 && "New Password"}
            {step === 4 && "Password Reset"}
          </h1>
          <p className="text-xs text-gray-500 mt-1 m-0">
            {step === 1 && "Enter your email to receive recovery code"}
            {step === 2 && `Enter 6-digit code sent to ${email}`}
            {step === 3 && "Create a new secure password"}
            {step === 4 && "Your password has been updated successfully"}
          </p>
        </div>

        {/* Message / Alerts */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-semibold leading-relaxed animate-in fade-in ${
              isError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3.5">
            {/* Role Toggle Pill */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  role === "admin"
                    ? "bg-white text-black shadow-xs"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Mall Manager
              </button>
              <button
                type="button"
                onClick={() => setRole("shop admin")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  role === "shop admin"
                    ? "bg-white text-black shadow-xs"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                Shop Counter
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Registered Email
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

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Sending Code..." : "Send Verification Code"}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider text-center">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full py-2.5 text-center tracking-[0.4em] text-lg font-mono font-bold bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl outline-none transition-all placeholder:tracking-normal placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Verifying..." : "Verify Code"}</span>
              <ArrowRight size={15} />
            </button>

            <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-[11px] font-bold text-gray-600 hover:text-black cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={11} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend Code"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setMessage("");
                  setIsError(false);
                }}
                className="text-[11px] text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Updating Password..." : "Update Password"}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-3.5 text-center py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-xs text-gray-500 m-0 leading-relaxed">
              Your password has been changed successfully. You can now sign in with your new credentials.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-2.5 bg-[#111215] hover:bg-black text-white text-xs sm:text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Back to Sign In Link */}
        {step !== 4 && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 text-[11px] font-bold text-gray-500 hover:text-black flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
