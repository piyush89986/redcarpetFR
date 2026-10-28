import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Store,
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

      {/* Top Navbar */}
      <header className="w-full max-w-md flex items-center justify-between mb-3 sm:mb-4 z-10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft size={13} strokeWidth={2.8} />
          <span>Back to Sign In</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>PORTAL RECOVERY</span>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md bg-white border border-gray-200/80 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 flex flex-col">
        {/* Step Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#111215] text-[#e5fc73] flex items-center justify-center mx-auto mb-3 shadow-md">
            {step === 4 ? (
              <CheckCircle2 size={28} strokeWidth={2.5} />
            ) : (
              <KeyRound size={26} strokeWidth={2.2} />
            )}
          </div>

          <h1 className="text-2xl sm:text-[26px] font-black text-gray-950 tracking-tight leading-tight m-0 mb-1.5">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Set New Password"}
            {step === 4 && "Password Reset Complete"}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto m-0">
            {step === 1 && "Select your portal role and enter your registered email address."}
            {step === 2 && `We sent a 6-digit OTP code to ${email}.`}
            {step === 3 && "Choose a strong new password for your portal account."}
            {step === 4 && "Your credentials have been securely updated. You can now log in."}
          </p>

          {/* Stepper Indicator (Steps 1 to 3) */}
          {step <= 3 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step >= 1 ? "bg-[#111215] text-[#e5fc73]" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
                <span className="text-xs font-bold text-gray-900">Email</span>
              </div>

              <div className={`w-8 h-0.5 rounded ${step >= 2 ? "bg-black" : "bg-gray-200"}`} />

              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step >= 2 ? "bg-[#111215] text-[#e5fc73]" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
                <span className={`text-xs font-bold ${step >= 2 ? "text-gray-900" : "text-gray-400"}`}>
                  Verify
                </span>
              </div>

              <div className={`w-8 h-0.5 rounded ${step >= 3 ? "bg-black" : "bg-gray-200"}`} />

              <div className="flex items-center gap-1.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step >= 3 ? "bg-[#111215] text-[#e5fc73]" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  3
                </div>
                <span className={`text-xs font-bold ${step >= 3 ? "text-gray-900" : "text-gray-400"}`}>
                  Reset
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Message / Alerts */}
        {message && (
          <div
            className={`mb-5 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2.5 ${
              isError
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            {isError ? (
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* STEP 1: Email & Role Form */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            {/* Role Radio Cards */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Mall Manager */}
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    role === "admin"
                      ? "border-black bg-[#111215] text-white shadow-sm"
                      : "border-gray-200 bg-[#f8faf9] hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <Building2
                    size={18}
                    className={role === "admin" ? "text-[#e5fc73]" : "text-gray-500"}
                  />
                  <span className="text-xs font-bold mt-1">Mall Manager</span>
                  <span className="text-[10px] opacity-70">Executive Portal</span>
                </button>

                {/* Shop / Store Counter */}
                <button
                  type="button"
                  onClick={() => setRole("shop admin")}
                  className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    role === "shop admin"
                      ? "border-black bg-[#111215] text-white shadow-sm"
                      : "border-gray-200 bg-[#f8faf9] hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <Store
                    size={18}
                    className={role === "shop admin" ? "text-[#e5fc73]" : "text-gray-500"}
                  />
                  <span className="text-xs font-bold mt-1">Shop / Store</span>
                  <span className="text-[10px] opacity-70">Counter Staff</span>
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder={role === "admin" ? "manager@phoenixmall.com" : "zara@phoenixmall.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Sending Security Code..." : "Send Verification Code"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 text-center">
                Enter 6-Digit Email Code
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full py-4 text-center tracking-[0.5em] text-2xl font-mono font-bold bg-[#f8faf9] border-2 border-gray-300 focus:border-black focus:bg-white rounded-2xl outline-none transition-all placeholder:tracking-normal placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Verifying..." : "Verify Code & Proceed"}</span>
              <ArrowRight size={16} />
            </button>

            {/* Controls */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-xs font-bold text-gray-600 hover:text-black cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw size={12} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive email? Resend Code"}
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
                className="text-xs font-semibold text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
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

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Updating Password..." : "Update Password & Sign In"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 4: Success Confirmation */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <p className="text-xs text-gray-500 m-0 leading-relaxed">
              Your password has been changed. You can now access your manager or shop dashboard with your new credentials.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Security Assurance */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-semibold">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Encrypted SMTP Verification • End-to-end Protected</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-gray-400 font-medium">
        Powered by <strong className="text-gray-700">Red Carpet VIP Concierge</strong>
      </footer>
    </div>
  );
};

export default ForgotPassword;
