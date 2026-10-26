import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";
import "./Information.css";

function Information() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mall, setMall] = useState(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
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

    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailPattern.test(cleanEmail)) {
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

        setSuccessMsg("Verification code has been sent to your phone via SMS!");
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
      setErrorMsg("Please enter the 4-digit verification code.");
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
        // Save user into phoenixusers queue
        const tokenNum = generateToken();
        const { data: infoData } = await axios.post(`${apiBase}/api/information`, {
          name: name.trim(),
          mobile: cleanMobile,
          email: email.trim(),
          token: tokenNum,
          shopid: id,
        });

        const userId = infoData?.newInfo?._id || "";
        localStorage.setItem("token", String(tokenNum));
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

  return (
    <div className="rc-info-page">
      <div className="rc-info-wrapper">
        {/* Mall & Brand Header Banner */}
        <div className="rc-info-header">
          <div className="rc-info-badge">
            <span className="rc-info-pulse"></span>
            Red Carpet VIP Pass
          </div>
          <h1 className="rc-info-title">
            {mall?.title || "VIP Blue Cart Concierge"}
          </h1>
          <p className="rc-info-sub">
            Fast-track your shopping experience with priority counter access & luxury concierge cart.
          </p>

          {/* Stepper indicator */}
          <div className="rc-stepper">
            <div className={`rc-step-item ${step >= 1 ? "active" : ""}`}>
              <div className="rc-step-circle">1</div>
              <span>Guest Details</span>
            </div>
            <div className={`rc-step-line ${step >= 2 ? "active" : ""}`}></div>
            <div className={`rc-step-item ${step >= 2 ? "active" : ""}`}>
              <div className="rc-step-circle">2</div>
              <span>SMS Verify</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rc-info-card">
          {errorMsg && (
            <div className="rc-alert rc-alert-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="rc-alert rc-alert-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Registration Form */
            <form onSubmit={handleSendOtp} className="rc-form-stack">
              <div className="rc-form-group">
                <label className="rc-label">Full Name *</label>
                <div className="rc-input-icon-wrap">
                  <span className="rc-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rc-input rc-input-with-icon"
                    required
                  />
                </div>
              </div>

              <div className="rc-form-group">
                <label className="rc-label">Mobile Number *</label>
                <div className="rc-input-icon-wrap">
                  <span className="rc-phone-prefix">+91</span>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="rc-input rc-input-phone"
                    required
                  />
                </div>
              </div>

              <div className="rc-form-group">
                <label className="rc-label">Email Address *</label>
                <div className="rc-input-icon-wrap">
                  <span className="rc-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rc-input rc-input-with-icon"
                    required
                  />
                </div>
              </div>

              {/* VIP Perks */}
              <div className="rc-perks-row">
                <div className="rc-perk-item">
                  <span className="rc-perk-icon">⚡</span>
                  <span>Zero Queue Waiting</span>
                </div>
                <div className="rc-perk-item">
                  <span className="rc-perk-icon">🛍️</span>
                  <span>Dedicated Blue Cart</span>
                </div>
                <div className="rc-perk-item">
                  <span className="rc-perk-icon">📲</span>
                  <span>SMS Status Alerts</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                style={{ width: "100%", marginTop: "12px" }}
              >
                {loading ? "Sending Code..." : "Continue to Verification"}
              </Button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="rc-form-stack">
              <div className="rc-otp-header">
                <div className="rc-otp-icon-bubble">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <h3>Enter SMS Verification Code</h3>
                <p>
                  Please enter the security code sent via SMS to{" "}
                  <strong>+91 {mobile}</strong>
                </p>
              </div>

              <div className="rc-otp-input-wrap">
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  maxLength="6"
                  autoFocus
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="rc-otp-field"
                  required
                />
              </div>



              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                style={{ width: "100%", marginTop: "8px" }}
              >
                {loading ? "Verifying Code..." : "Verify & Issue VIP Pass"}
              </Button>

              <div className="rc-otp-actions">
                <button
                  type="button"
                  className="rc-text-btn"
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0
                    ? `Resend Code in ${resendCooldown}s`
                    : "Didn't receive SMS? Resend Code"}
                </button>
                <button
                  type="button"
                  className="rc-text-btn rc-text-btn-secondary"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                >
                  Change mobile number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Information;
