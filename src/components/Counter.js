import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar, Button, StatCard } from "./common";
import API_BASE from "../apiConfig";
import "./common/common.css";

const Counter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const apiBase = API_BASE;
  const userRole = localStorage.getItem("role") || "admin";

  // Fetch shop or mall details
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${apiBase}/api/shops/${id}`)
      .then((res) => setShopInfo(res.data))
      .catch((err) => console.log("Notice: shop info not loaded:", err.message));
  }, [id, apiBase]);

  // Fetch real-time queue data from API
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBase}/api/get-data/${id}`);
      let fetchedData = response.data || [];

      // Retrieve clicked state from localStorage
      const savedClickedState =
        JSON.parse(localStorage.getItem("clickedState")) || {};

      fetchedData = fetchedData.map((item) => ({
        ...item,
        clicked: savedClickedState[item._id] || false,
      }));

      setData(fetchedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching queue data:", error);
      setLoading(false);
    }
  }, [id, apiBase]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const saveClickedState = (updatedData) => {
    const clickedState = updatedData.reduce((acc, item) => {
      acc[item._id] = item.clicked;
      return acc;
    }, {});
    localStorage.setItem("clickedState", JSON.stringify(clickedState));
  };

  // Start 180s Countdown
  const startCountdown = async (phoneNumber) => {
    try {
      const duration = 180;
      await fetch(`${apiBase}/api/start-countdown`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration, phoneNumber, shopId: id }),
      });
    } catch (err) {
      console.error("Error starting countdown:", err);
    }
  };

  // Handle calling the customer
  const handleSendMessage = async (number) => {
    if (!number) return;
    try {
      const response = await axios.post(`${apiBase}/api/send-message`, {
        number,
      });
      if (response.data.success) {
        alert("Alert notification sent to customer successfully.");
      }
    } catch (error) {
      console.error("Error sending SMS alert:", error);
    }
  };

  const handleCallCustomer = async (index) => {
    const newData = JSON.parse(JSON.stringify([...data]));
    newData[index].clicked = true;
    setData(newData);
    saveClickedState(newData);

    const userMobile = newData[index].mobile;
    await handleSendMessage(userMobile);
    await startCountdown(userMobile);
  };

  const filteredQueue = data.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.mobile?.toLowerCase().includes(query) ||
      String(item.token || "").toLowerCase().includes(query)
    );
  });

  const waitingCount = data.filter((d) => !d.clicked).length;
  const calledCount = data.filter((d) => d.clicked).length;

  return (
    <div className="rc-page-container">
      {/* Reusable White & Blue Navbar */}
      <Navbar
        brandBadge={shopInfo?.title || shopInfo?.name ? `${shopInfo.title || shopInfo.name} Counter` : "Live Counter"}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search token #, customer, mobile..."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (userRole === "superadmin") {
                  navigate(`/shop/${shopInfo?.mallId || id}`);
                } else {
                  const mallId = shopInfo?.mallId || localStorage.getItem("shopId") || id;
                  navigate(`/branddashboard2/${mallId}`);
                }
              }}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              }
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/qrcode?shopId=${id}`)}
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              }
            >
              Shop QR
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(`/${id}/countdown`, "_blank")}
              title="Open Live TV Countdown Screen in a new tab"
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
            >
              TV Screen
            </Button>
          </>
        }
      />

      <main className="rc-main-content">
        {/* Real-time Queue Stats */}
        <section className="rc-stats-grid">
          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            label="Total In-Queue Tokens"
            value={data.length}
            sub="Active 12-hour session"
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
            label="Waiting for Call"
            value={waitingCount}
            sub="Next in line"
          />

          <StatCard
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            label="Called & Served"
            value={calledCount}
            sub="Completed dispatch"
          />
        </section>

        {/* Section Heading */}
        <div className="rc-section-header">
          <div>
            <h2 className="rc-section-title">
              {shopInfo?.title || shopInfo?.name ? `${shopInfo.title || shopInfo.name} Live Queue` : "Live Counter Queue"}
            </h2>
            <p className="rc-section-desc">
              Active queue for the current 12-hour session. Token numbers refresh and reset every 12 hours.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            }
          >
            Refresh Queue
          </Button>
        </div>

        {/* Queue Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--rc-blue-600)" }}>
            <p style={{ fontWeight: 600 }}>Loading live queue...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div
            style={{
              background: "var(--rc-white)",
              border: "1px dashed var(--rc-blue-200)",
              borderRadius: "var(--rc-radius-xl)",
              padding: "60px 24px",
              textAlign: "center",
              maxWidth: "500px",
              margin: "40px auto",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎫</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px 0" }}>Queue is Empty</h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px" }}>
              {search
                ? `No queue entries matching "${search}".`
                : "No customer tokens are currently waiting in this counter's queue."}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "var(--rc-white)",
              border: "1px solid var(--rc-border)",
              borderRadius: "var(--rc-radius-xl)",
              overflow: "hidden",
              boxShadow: "var(--rc-shadow-sm)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--rc-blue-50)", borderBottom: "1px solid var(--rc-border-blue)" }}>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)" }}>
                      # S.No
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)" }}>
                      Token ID
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)" }}>
                      Customer Name
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)" }}>
                      Mobile Contact
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)" }}>
                      Status
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)", textAlign: "right" }}>
                      Queue Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item, index) => (
                    <tr
                      key={item._id || index}
                      style={{
                        borderBottom: "1px solid var(--rc-border)",
                        background: index % 2 === 0 ? "var(--rc-white)" : "#fafcff",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "var(--rc-text-muted)", fontWeight: 600 }}>
                        {index + 1}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "var(--rc-radius-sm)",
                            background: "var(--rc-blue-50)",
                            color: "var(--rc-blue-700)",
                            fontWeight: 800,
                            fontSize: "14px",
                            border: "1px solid var(--rc-blue-200)",
                            letterSpacing: "0.5px",
                          }}
                        >
                          #{item.token || String(index + 1).padStart(3, "0")}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 700, color: "var(--rc-text-main)" }}>
                        {item.name || "Walk-in Guest"}
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "var(--rc-text-body)" }}>
                        {item.mobile || "—"}
                      </td>

                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "9999px",
                            fontSize: "12px",
                            fontWeight: 700,
                            background: item.clicked ? "#f1f5f9" : "var(--rc-blue-50)",
                            color: item.clicked ? "var(--rc-text-muted)" : "var(--rc-blue-600)",
                            border: `1px solid ${item.clicked ? "#e2e8f0" : "var(--rc-blue-200)"}`,
                          }}
                        >
                          {item.clicked ? "✓ Called / Served" : "● Waiting"}
                        </span>
                      </td>

                      <td style={{ padding: "16px 20px", textAlign: "right" }}>
                        <Button
                          variant={item.clicked ? "outline" : "primary"}
                          size="sm"
                          onClick={() => handleCallCustomer(index)}
                          icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                          }
                        >
                          {item.clicked ? "Call Again" : "Call Customer"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Counter;
