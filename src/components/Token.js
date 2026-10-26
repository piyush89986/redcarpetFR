import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";
import "./Token.css";

function Token() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(!token);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const phone = localStorage.getItem("phone");
        const apiBase = API_BASE;
        const response = await axios.get(`${apiBase}/api/get-token?phone=${phone}`);
        if (response.data?.token) {
          setToken(response.data.token);
          localStorage.setItem("token", String(response.data.token));
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      fetchToken();
    }
  }, [token]);

  return (
    <div className="rc-token-page">
      <div className="rc-token-card">
        <div className="rc-token-badge">
          VIP Access Granted
        </div>

        <h1 className="rc-token-title">Your Priority Pass is Ready</h1>
        <p className="rc-token-sub">
          Your blue cart concierge pass has been generated. Please keep this token handy at the counter.
        </p>

        <div className="rc-token-orb-wrap">
          <div className="rc-token-orb">
            <span className="rc-token-tag">TOKEN NO.</span>
            <span className="rc-token-number">
              {loading ? "..." : token ? `#${token}` : "#101"}
            </span>
          </div>
        </div>

        <div className="rc-token-alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <div>
            <strong>SMS Notification Active</strong>
            <p>You will receive an SMS alert as soon as your counter slot is called.</p>
          </div>
        </div>

        <div className="rc-token-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/${id}/counter`)}
            style={{ width: "100%" }}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            }
          >
            Track Live Counter Queue
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(`/${id}/countdown`)}
            style={{ width: "100%", marginTop: "8px" }}
          >
            Open Live Countdown Timer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Token;
