// Centralized and robust API Base URL configuration
// Dynamically reads from process.env.REACT_APP_API_BASE_URL and strips any trailing slash.
// Automatically falls back to localhost during local development or production Render backend when deployed.

const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // Fallback depending on host environment
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("10.") ||
      window.location.hostname.startsWith("192.168.");

    if (isLocalhost) {
      return "http://localhost:5000";
    }
  }

  return "https://redcarpetbac.onrender.com";
};

export const API_BASE = getApiBaseUrl();

export default API_BASE;
