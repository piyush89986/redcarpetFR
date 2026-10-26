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


  const [autoSmsEnabled, setAutoSmsEnabled] = useState(
    JSON.parse(localStorage.getItem("autoSmsEnabled") ?? "true")
  );
  const [alertAheadSlots, setAlertAheadSlots] = useState(
    Number(localStorage.getItem("alertAheadSlots") || "2")
  );
  const [smsAlertedMap, setSmsAlertedMap] = useState(
    JSON.parse(localStorage.getItem("smsAlertedMap") || "{}")
  );
  const [lastSmsAlert, setLastSmsAlert] = useState(null);

  const apiBase = API_BASE;
  const rawRole = (localStorage.getItem("role") || "").toLowerCase().trim();
  const userRole = rawRole;
  const storedShopId = localStorage.getItem("shopId");

  // Scoped Access Control:
  // 0. Only authenticated staff can view the Live Counter
  // 1. Shop Admin can only access their own store's live counter
  // 2. Mall Admin can only access counters within their own mall
  useEffect(() => {
    if (!rawRole || !["admin", "superadmin", "shop admin", "shopadmin", "shop"].includes(rawRole)) {
      console.warn("Access Denied: Unauthenticated user attempted to access staff counter queue.");
      navigate("/", { replace: true });
      return;
    }

    if (
      (rawRole === "shop admin" || rawRole === "shopadmin" || rawRole === "shop") &&
      storedShopId &&
      id &&
      id !== storedShopId
    ) {
      console.warn("Access Restricted: Counter staff can only access their assigned store queue.");
      navigate(`/${storedShopId}/counter`, { replace: true });
    }

    if (rawRole === "admin" && storedShopId && shopInfo) {
      const mallId = shopInfo.mallId || shopInfo._id;
      if (mallId && String(mallId) !== String(storedShopId)) {
        console.warn("Access Restricted: Admin can only view live counters within their own mall.");
        navigate(`/branddashboard2/${storedShopId}`, { replace: true });
      }
    }
  }, [rawRole, storedShopId, id, shopInfo, navigate]);

  // Fetch shop details
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


  // Send SMS Message (with store template, applied time/date & Twilio error resilience)
  const handleSendMessage = async ({ number, name, token, createdAt, alertType, message }) => {
    if (!number) return;
    try {
      const storeName = shopInfo?.title || shopInfo?.name || "Store Counter";
      const mallName = shopInfo?.mallTitle || "";
      const response = await axios.post(`${apiBase}/api/send-message`, {
        number,
        name,
        token,
        createdAt,
        storeName,
        mallName,
        alertType,
        message,
        shopId: id,
      });
      if (response.data) {
        setLastSmsAlert(response.data);
      }
      return response.data;
    } catch (error) {
      console.error("Error sending SMS alert:", error);
    }
  };


  // Manual SMS Trigger by staff
  const handleSendManualAlert = async (customer) => {
    if (!customer?.mobile) return;
    const res = await handleSendMessage({
      number: customer.mobile,
      name: customer.name,
      token: customer.token,
      createdAt: customer.createdAt,
      alertType: "approaching",
    });
    const updatedAlertMap = { ...smsAlertedMap, [customer._id]: true };
    setSmsAlertedMap(updatedAlertMap);
    localStorage.setItem("smsAlertedMap", JSON.stringify(updatedAlertMap));
    if (res?.body) {
      alert(`SMS Alert dispatched:\n"${res.body}"`);
    } else {
      alert(`Approaching SMS alert sent to ${customer.name || "customer"} (${customer.mobile}).`);
    }
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
        brandBadge="Live Counter"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search token #, customer, mobile..."
        actions={
          <>
            {(userRole === "admin" || userRole === "superadmin") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (userRole === "superadmin") {
                    navigate(shopInfo?.mallId ? `/branddashboard2/${shopInfo.mallId}` : `/branddashboard2/${id}`);
                  } else {
                    const mallId = storedShopId || shopInfo?.mallId || id;
                    navigate(`/branddashboard2/${mallId}`);
                  }
                }}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                }
              >
                Mall Dashboard
              </Button>
            )}
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
            sub="Active today's queue"
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
            label="Called &amp; Served"
            value={calledCount}
            sub="Completed dispatch"
          />
        </section>

        {/* Dynamic SMS Notification Banner */}
        {lastSmsAlert && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "14px",
              marginBottom: "24px",
              border: `1px solid ${
                lastSmsAlert.delivered
                  ? "#a7f3d0"
                  : lastSmsAlert.trialRestricted
                  ? "#fde68a"
                  : "#bfdbfe"
              }`,
              background: lastSmsAlert.delivered
                ? "#ecfdf5"
                : lastSmsAlert.trialRestricted
                ? "#fffbeb"
                : "#eff6ff",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: lastSmsAlert.delivered ? "#059669" : lastSmsAlert.trialRestricted ? "#d97706" : "#2563eb",
                    color: "#ffffff",
                  }}
                >
                  {lastSmsAlert.delivered
                    ? "SMS Dispatched"
                    : lastSmsAlert.trialRestricted
                    ? "Carrier Notice (Twilio Trial - 572006)"
                    : "Template Processed"}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--rc-text-main)" }}>
                  {lastSmsAlert.delivered
                    ? "Delivered to Phone Carrier"
                    : lastSmsAlert.trialRestricted
                    ? "Twilio Trial Restriction Active"
                    : "SMS Rendered"}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#1e293b",
                  margin: "6px 0",
                  background: "#ffffff",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                "{lastSmsAlert.body}"
              </p>
              {lastSmsAlert.trialRestricted && (
                <p style={{ fontSize: "12px", color: "#92400e", margin: "4px 0 0 0" }}>
                  💡 <strong>Why handset didn't receive it:</strong> Twilio Free Trial accounts only allow pre-approved templates (Error 572006). To deliver custom dynamic SMS to customer mobile phones, upgrade your Twilio account balance in Twilio Console.
                </p>
              )}
            </div>
            <button
              onClick={() => setLastSmsAlert(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "var(--rc-text-muted)",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Section Heading & Automation Controls */}
        <div className="rc-section-header" style={{ flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h2 className="rc-section-title">
              {shopInfo?.title || shopInfo?.name ? `${shopInfo.title || shopInfo.name} Live Queue` : "Live Counter Queue"}
            </h2>
            <p className="rc-section-desc">
              Active live queue for today. Automatically refreshes and starts from 1 everyday.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Automation Toggle Button */}
            <Button
              variant={autoSmsEnabled ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                const next = !autoSmsEnabled;
                setAutoSmsEnabled(next);
                localStorage.setItem("autoSmsEnabled", JSON.stringify(next));
              }}
              title="Toggle automatic SMS notification when a customer's turn approaches"
            >
              {autoSmsEnabled ? `● Auto-SMS: ON (${alertAheadSlots} Ahead)` : "○ Auto-SMS: OFF (Manual)"}
            </Button>

            {/* Slots ahead selector */}
            {autoSmsEnabled && (
              <select
                className="rc-input"
                style={{ padding: "6px 10px", fontSize: "13px", height: "36px", width: "auto" }}
                value={alertAheadSlots}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAlertAheadSlots(val);
                  localStorage.setItem("alertAheadSlots", String(val));
                }}
                title="Number of spots ahead to send notification"
              >
                <option value={1}>Notify 1 Ahead (Next)</option>
                <option value={2}>Notify 2 Ahead (Default)</option>
                <option value={3}>Notify 3 Ahead</option>
              </select>
            )}

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
              Refresh
            </Button>
          </div>
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
                      Queue Status
                    </th>
                    <th style={{ padding: "14px 20px", fontSize: "13px", fontWeight: 700, color: "var(--rc-blue-900)", textAlign: "right" }}>
                      Queue Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item, index) => {
                    const isAlerted = !!smsAlertedMap[item._id];
                    return (
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
                            #{item.token || String(index + 1)}
                          </span>
                        </td>

                        <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 700, color: "var(--rc-text-main)" }}>
                          {item.name || "Walk-in Guest"}
                        </td>

                        <td style={{ padding: "16px 20px", fontSize: "14px", color: "var(--rc-text-body)" }}>
                          {item.mobile || "—"}
                        </td>

                        <td style={{ padding: "16px 20px" }}>
                          {item.clicked ? (
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: 700,
                                background: "#f1f5f9",
                                color: "var(--rc-text-muted)",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              ✓ Called / Served
                            </span>
                          ) : isAlerted ? (
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: 700,
                                background: "#ecfdf5",
                                color: "#047857",
                                border: "1px solid #a7f3d0",
                              }}
                            >
                              🔔 Approaching SMS Sent
                            </span>
                          ) : (
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: 700,
                                background: "var(--rc-blue-50)",
                                color: "var(--rc-blue-600)",
                                border: "1px solid var(--rc-blue-200)",
                              }}
                            >
                              ● Waiting in Line
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                            {/* Manual SMS Trigger */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendManualAlert(item)}
                              title="Send approaching template SMS alert manually"
                              icon={
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                              }
                            >
                              {isAlerted ? "SMS Sent" : "Alert SMS"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
