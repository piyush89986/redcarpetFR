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
  const [token, setToken] = useState(
    localStorage.getItem("queueToken") || localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(!token);
  const [shopDetails, setShopDetails] = useState(null);
  const userRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const isStaff = ["shop admin", "shopadmin", "shop", "admin", "superadmin"].includes(userRole);

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE}/api/shops/${id}`)
      .then((res) => setShopDetails(res.data))
      .catch((err) => console.log("Shop detail notice:", err.message));
  }, [id]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const phone = localStorage.getItem("phone");
        const apiBase = API_BASE;
        const response = await axios.get(`${apiBase}/api/get-token?phone=${phone}`);
        if (response.data?.token) {
          setToken(response.data.token);
          localStorage.setItem("queueToken", String(response.data.token));
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

  const targetName = shopDetails?.title || shopDetails?.name || "Red Carpet VIP";

  return (
    <div className="rc-token-page">
      <div className="rc-token-card">
        <div className="rc-token-badge">
          VIP Access Granted
        </div>

        <h1 className="rc-token-title">Your Priority Pass is Ready</h1>
        <p className="rc-token-sub">
          {targetName} concierge pass generated. Please keep this token handy when approaching the counter.
        </p>

        <div className="rc-token-orb-wrap">
          <div className="rc-token-orb">
            <span className="rc-token-tag">TOKEN NO.</span>
            <span className="rc-token-number">
              {loading ? "..." : token ? `#${token}` : "#1"}
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
            <p>You will receive an automatic SMS alert when your counter slot is approaching!</p>
          </div>
        </div>

        <div className="rc-token-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/${id}/countdown`)}
            style={{ width: "100%" }}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          >
            Open Live Service Countdown
          </Button>

          {isStaff && (
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(`/${id}/counter`)}
              style={{ width: "100%", marginTop: "8px" }}
            >
              Staff: Open Live Counter Queue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Token;
