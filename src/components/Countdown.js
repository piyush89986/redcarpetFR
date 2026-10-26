import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Button } from "./common";
import "./common/common.css";

const socket = io(process.env.REACT_APP_API_BASE_URL || "http://localhost:5000");

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(180);
  const [progress, setProgress] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/get-countdown`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.startTime) {
          startCountdown(data.startTime, data.duration || 180);
        }
      })
      .catch((err) => console.error("Error fetching countdown:", err));

    socket.on("countdown-start", ({ startTime, duration }) => {
      startCountdown(startTime, duration || 180);
    });

    return () => socket.off("countdown-start");
  }, []);

  const startCountdown = (startTime, duration) => {
    const endTime = startTime + duration * 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      const percentageFilled = ((duration - remaining) / duration) * 100;
      setProgress(percentageFilled);

      if (remaining === 0) {
        clearInterval(interval);
        setTimeout(() => setShowMessage(true), 1200);
      }
    }, 1000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
        color: "var(--rc-text-main)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        textAlign: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "var(--rc-white)",
          border: "1px solid var(--rc-border-blue)",
          borderRadius: "var(--rc-radius-xl)",
          padding: "48px 36px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "var(--rc-shadow-lg)",
        }}
      >
        <span
          style={{
            padding: "4px 14px",
            borderRadius: "9999px",
            background: "var(--rc-blue-50)",
            color: "var(--rc-blue-700)",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            border: "1px solid var(--rc-blue-200)",
            display: "inline-block",
            marginBottom: "16px",
          }}
        >
          ● Live Dispatch Call
        </span>

        <h1 style={{ fontSize: "28px", fontWeight: 900, color: "var(--rc-blue-900)", margin: "0 0 8px 0" }}>
          {showMessage ? "Your Turn Is Complete" : "Please Proceed to Counter"}
        </h1>

        <p style={{ color: "var(--rc-text-muted)", fontSize: "15px", margin: "0 0 32px 0" }}>
          {showMessage
            ? "Thank you for visiting RedCarpet. Have a wonderful day!"
            : "Your token has been called. Time remaining for your service window:"}
        </p>

        {/* Circular Timer Ring */}
        {!showMessage ? (
          <div
            style={{
              position: "relative",
              width: "220px",
              height: "220px",
              margin: "0 auto 32px auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: `conic-gradient(var(--rc-blue-600) ${progress * 3.6}deg, var(--rc-blue-100) 0deg)`,
              padding: "10px",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.2)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "var(--rc-white)",
                borderRadius: "50%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "44px", fontWeight: 900, color: "var(--rc-blue-700)", letterSpacing: "-1px" }}>
                {formattedTime}
              </span>
              <span style={{ fontSize: "12px", color: "var(--rc-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                Minutes : Seconds
              </span>
            </div>
          </div>
        ) : (
          <div style={{ padding: "40px 0" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--rc-blue-700)", margin: "0 0 8px 0" }}>
              Thank You For Your Visit!
            </h3>
            <p style={{ color: "var(--rc-text-muted)", fontSize: "14px", margin: 0 }}>
              Order dispatched successfully.
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button variant="primary" onClick={() => navigate("/branddashboard")}>
            Browse Malls
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
