import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { QrCode, Clock, ShoppingBag } from "lucide-react";
import { Button } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";
import "./PaymentPage.css";

const PaymentPage = ({ amount = 120 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mall, setMall] = useState(null);

  const apiBase = API_BASE;

  // Fetch Mall Details dynamically to match the rest of the application
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => setMall(res.data))
      .catch((err) => console.log("Mall info notice:", err.message));
  }, [id, apiBase]);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(`/${id}/token`);
    }, 1500);
  };

  return (
    <div className="rc-payment-page">
      <div className="rc-payment-wrapper">
        {/* Header & Mall Branding */}
        <div className="rc-payment-header">
          <div className="rc-payment-badge">
            <span className="rc-payment-pulse"></span>
            Red Carpet VIP Pass
          </div>
          <h1 className="rc-payment-title">
            {mall?.title || "VIP Blue Cart Concierge"}
          </h1>
          <p className="rc-payment-sub">
            Fast-track your shopping experience with priority counter access &amp; luxury concierge cart.
          </p>

          {/* Stepper indicator aligning with Information.js */}
          <div className="rc-payment-stepper">
            <div className="rc-pay-step-item active">
              <div className="rc-pay-step-circle">✓</div>
              <span>Guest Details</span>
            </div>
            <div className="rc-pay-step-line active"></div>
            <div className="rc-pay-step-item active">
              <div className="rc-pay-step-circle">✓</div>
              <span>SMS Verified</span>
            </div>
            <div className="rc-pay-step-line active"></div>
            <div className="rc-pay-step-item active">
              <div className="rc-pay-step-circle">3</div>
              <span>VIP Payment</span>
            </div>
          </div>
        </div>

        {/* Main Payment & Pass Card */}
        <div className="rc-payment-card">
          {/* Process Steps */}
          <div className="rc-process-steps">
            <div className="rc-step-card">
              <div className="rc-step-card-icon">
                <QrCode size={22} />
              </div>
              <div className="rc-step-card-content">
                <h3>Scan QR Code</h3>
                <p>Scan the QR code at any mall counter</p>
              </div>
            </div>

            <div className="rc-step-card">
              <div className="rc-step-card-icon">
                <Clock size={22} />
              </div>
              <div className="rc-step-card-content">
                <h3>Book Time Slot</h3>
                <p>Choose your preferred billing time</p>
              </div>
            </div>

            <div className="rc-step-card">
              <div className="rc-step-card-icon">
                <ShoppingBag size={22} />
              </div>
              <div className="rc-step-card-content">
                <h3>Priority Checkout</h3>
                <p>Skip the line with priority billing &amp; concierge cart</p>
              </div>
            </div>
          </div>

          {/* What You Get / Benefits */}
          <div className="rc-benefits-box">
            <h3 className="rc-benefits-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              What You Get
            </h3>
            <div className="rc-benefits-list">
              <div className="rc-benefit-row">
                <span className="rc-benefit-check">✓</span>
                <span>SMS notifications for your turn</span>
              </div>
              <div className="rc-benefit-row">
                <span className="rc-benefit-check">✓</span>
                <span>Dedicated Blue Cart concierge access</span>
              </div>
              <div className="rc-benefit-row">
                <span className="rc-benefit-check">✓</span>
                <span>Digital receipt &amp; token for easy tracking</span>
              </div>
              <div className="rc-benefit-row">
                <span className="rc-benefit-check">✓</span>
                <span>24/7 customer support &amp; counter assistance</span>
              </div>
            </div>
          </div>

          {/* Price Tag */}
          <div className="rc-price-card">
            <div className="rc-price-amount">₹{amount}</div>
            <div className="rc-price-period">One-Time VIP Concierge Fee</div>
            <div className="rc-price-hint">Includes priority digital queue pass &amp; express checkout</div>
          </div>

          {/* Actions */}
          <div className="rc-payment-actions">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePayment}
              disabled={loading}
              style={{ width: "100%", padding: "14px 20px" }}
              icon={
                !loading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                ) : null
              }
            >
              {loading ? "Activating VIP Pass..." : "Book Appointment"}
            </Button>

            <div className="rc-secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Instant VIP activation • SMS confirmation included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;