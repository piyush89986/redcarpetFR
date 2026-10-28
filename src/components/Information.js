import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw
} from "lucide-react";
import API_BASE from "../apiConfig";

function Information() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mall, setMall] = useState(null);
  const [name, setName] = useState(localStorage.getItem("userName") || "");
  const [mobile, setMobile] = useState(localStorage.getItem("phone") || "");
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const apiBase = API_BASE;

  // Fetch Mall Details
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => setMall(res.data))
      .catch((err) => console.log("Mall info notice:", err.message));

    // Persist real-time QR scan event in analytics database
    axios
      .post(`${apiBase}/api/analytics/track-scan`, { shopId: id, scanType: "page_view" })
      .catch(() => {});
  }, [id, apiBase]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const generateToken = () => {
    return Math.floor(Math.random() * 900) + 100;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, "");
    const cleanEmail = email.trim();

    if (mall?.subscriptionStatus === "inactive") {
      setErrorMsg("Platform subscription for this location is paused. Please contact administration.");
      return;
    }

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanEmail && !emailPattern.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Special secret redirect for maintenance
    if (cleanName === "itsoftlab" && cleanMobile === "6261822587") {
      navigate(`/${id}/editdisplay`);
      return;
    }

    setLoading(true);
    try {
      const token = generateToken();
      const { data } = await axios.post(`${apiBase}/api/send-otp`, {
        mobile: cleanMobile,
        name: cleanName,
        email: cleanEmail,
        token,
      });

      if (data.success) {
        localStorage.setItem("phone", cleanMobile);
        localStorage.setItem("userName", cleanName);
        localStorage.setItem("userEmail", cleanEmail);

        setSuccessMsg("Verification code sent via SMS to your phone!");
        setStep(2);
        setResendCooldown(30);
      } else {
        setErrorMsg(data.error || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setErrorMsg(err.response?.data?.error || "Error connecting to OTP service.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanOtp = String(otp).trim();
    if (!cleanOtp) {
      setErrorMsg("Please enter the verification code.");
      return;
    }

    setLoading(true);
    try {
      const cleanMobile = mobile.trim().replace(/\D/g, "");
      const res = await axios.post(`${apiBase}/api/verify-otp`, {
        mobile: cleanMobile,
        otp: cleanOtp,
      });

      if (res.data.success) {
        // Save user into queue with backend-assigned token
        const { data: infoData } = await axios.post(`${apiBase}/api/information`, {
          name: name.trim(),
          mobile: cleanMobile,
          email: email.trim(),
          shopid: id,
        });

        const assignedToken = infoData?.token || infoData?.newInfo?.token || "1";
        const userId = infoData?.newInfo?._id || "";
        localStorage.setItem("queueToken", String(assignedToken));
        localStorage.setItem("phone", cleanMobile);
        navigate(`/${id}/paymentpage?userId=${userId}`);
      } else {
        setErrorMsg("Invalid OTP code. Please check and try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMsg(err.response?.data?.error || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const storeTitle = mall?.title || mall?.name || "VIP Concierge";

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

      {/* Top Navbar / Brand Identity */}
      <header className="w-full max-w-md flex items-center justify-between mb-2.5 sm:mb-3 z-10">
        <button
          type="button"
          onClick={() => (step === 2 ? setStep(1) : navigate(`/${id}`))}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft size={12} strokeWidth={2.8} />
          <span>{step === 2 ? "Back" : "Store"}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-[11px] font-bold">
          <Sparkles size={12} className="text-amber-500" />
          <span>VIP REGISTRATION</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="w-full max-w-md bg-white border border-gray-200/80 rounded-[28px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.06)] relative z-10 flex flex-col">
        {/* Card Header & Title */}
        <div className="text-center mb-4">
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight leading-tight m-0 mb-1">
            {storeTitle}
          </h1>
          <p className="text-xs text-gray-500 max-w-xs mx-auto m-0">
            {step === 1
              ? "Register your mobile number to issue your priority queue pass."
              : "Verify your phone number with the security code sent via SMS."}
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 mt-3.5">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                  step >= 1 ? "bg-[#111215] text-[#e5fc73]" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="text-xs font-bold text-gray-900">Guest</span>
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
                SMS Verify
              </span>
            </div>

            <div className="w-8 h-0.5 rounded bg-gray-200" />

            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[11px] font-bold">
                3
              </div>
              <span className="text-xs font-bold text-gray-400">Pass</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Mobile Number (For SMS Queue Pass) *
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center justify-center px-3.5 py-3.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-2xl text-xs sm:text-sm font-bold text-gray-700 select-none">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  required
                  className="w-full px-4 py-3.5 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-r-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400 font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Email Address <span className="text-gray-400 font-normal normal-case">(Optional)</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8faf9] border border-gray-300 focus:border-black focus:bg-white rounded-2xl text-xs sm:text-sm font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "Sending Verification Code..." : "Continue to Verification"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm border border-amber-200/60">
                <KeyRound size={26} strokeWidth={2.2} />
              </div>

              <div className="text-sm font-bold text-gray-900">
                Enter 4-Digit SMS Code
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sent to <strong className="text-gray-800 font-mono">+91 {mobile}</strong>
              </div>
            </div>

            {/* OTP Input Field */}
            <div className="my-1">
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="• • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full py-4 text-center tracking-[0.5em] text-2xl font-mono font-bold bg-[#f8faf9] border-2 border-gray-300 focus:border-black focus:bg-white rounded-2xl outline-none transition-all placeholder:tracking-normal placeholder:text-gray-300"
              />
            </div>

            {/* Verify CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#111215] hover:bg-black text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck size={18} className="text-[#e5fc73]" />
              <span>{loading ? "Verifying Code..." : "Verify & Issue Priority Pass"}</span>
            </button>

            {/* OTP Action Controls */}
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
                    : "Didn't receive SMS? Resend Code"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
              >
                Change mobile number
              </button>
            </div>
          </form>
        )}

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-semibold">
          <ShieldCheck size={13} className="text-emerald-500" />
          <span>Encrypted SMS Service • Data strictly confidential</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center mt-6 text-[11px] text-gray-400 font-medium">
        Powered by <strong className="text-gray-700">Red Carpet VIP Concierge</strong>
      </footer>
    </div>
  );
}

export default Information;
