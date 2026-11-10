import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  X,
  User,
  Settings,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Store,
  Mail,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Save,
  Lock
} from "lucide-react";
import API_BASE from "../../apiConfig";

const ProfileModal = React.memo(({
  isOpen,
  onClose,
  totalMalls = 0,
  activeLicenses = 0,
  onSignOut,
  user = null,
  storeInfo = null,
  onProfileUpdated = null
}) => {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "settings"
  const [imgError, setImgError] = useState(false);

  // Settings Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const storedUser = useMemo(() => {
    if (user) return user;
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }, [user]);

  const storedRole = useMemo(() => {
    return (localStorage.getItem("role") || "admin").toLowerCase().trim();
  }, []);

  const storedShopId = useMemo(() => {
    return localStorage.getItem("shopId") || storeInfo?._id || storeInfo?.id || "";
  }, [storeInfo]);

  const isShopUser = useMemo(() => {
    return (
      storedRole === "shop admin" ||
      storedRole === "shopadmin" ||
      storedRole === "shop" ||
      storedRole.includes("shop")
    );
  }, [storedRole]);

  const avatarImage = storedUser?.image || storedUser?.avatar || storeInfo?.image || null;

  const initials = useMemo(() => {
    const rawName = storeInfo?.name || storeInfo?.title || storedUser?.name;
    if (rawName) {
      return rawName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (isShopUser) return "ST";
    return "AD";
  }, [storeInfo, storedUser, isShopUser]);

  const displayName =
    storeInfo?.name ||
    storeInfo?.title ||
    storedUser?.name ||
    (isShopUser ? "Store Counter Operator" : "Business Administrator");

  const displayEmail =
    storeInfo?.email ||
    storedUser?.email ||
    (isShopUser ? "staff@store.com" : "manager@business.com");

  // Sync form inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(storeInfo?.name || storeInfo?.title || storedUser?.name || "");
      setEmail(storeInfo?.email || storedUser?.email || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMsg("");
      setSuccessMsg("");
      setIsSaving(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, storeInfo, storedUser]);

  if (!isOpen) return null;

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg("Display name is required.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 4) {
        setErrorMsg("New password must be at least 4 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New passwords do not match.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const targetShopId = storedShopId;
      if (!targetShopId) {
        throw new Error("Store identity not identified. Please try logging in again.");
      }

      const payload = {
        name: cleanName,
        email: cleanEmail,
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      };

      const res = await axios.put(`${API_BASE}/api/shops/${targetShopId}/settings`, payload);

      if (res.data?.success) {
        setSuccessMsg(newPassword ? "Password and profile settings updated successfully!" : "Profile settings updated successfully!");

        // Update local storage representation
        const currentStored = storedUser || {};
        const updated = { ...currentStored, name: cleanName, email: cleanEmail };
        localStorage.setItem("user", JSON.stringify(updated));

        // Clear password fields
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        if (onProfileUpdated) {
          onProfileUpdated(res.data.store);
        }
      } else {
        setErrorMsg(res.data?.message || "Failed to update settings.");
      }
    } catch (err) {
      console.error("Profile settings update error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save settings. Please try again.";
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto"
    >
      <div
        className="bg-white rounded-[26px] sm:rounded-[30px] w-full max-w-lg sm:max-w-[540px] p-5 sm:p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 my-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
              <User size={16} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0 leading-tight">
                {isShopUser ? "Store Profile & Settings" : "Admin Account Profile"}
              </h3>
              <p className="text-[11px] text-gray-500 m-0 mt-0.5">
                Manage your credentials and counter preferences
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Switcher: Overview vs Settings */}
        <div className="mt-3 flex gap-1.5 p-1 bg-gray-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("overview");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#111215] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <User size={13} className={activeTab === "overview" ? "text-[#e5fc73]" : "text-gray-500"} />
            <span>Profile</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("settings");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#111215] text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
            }`}
          >
            <Settings size={13} className={activeTab === "settings" ? "text-[#e5fc73]" : "text-gray-500"} />
            <span>Settings &amp; Password</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="mt-4 text-center animate-in fade-in duration-200">
            {/* Avatar / Monogram */}
            <div className="relative w-16 h-16 mx-auto mb-3">
              {avatarImage && !imgError ? (
                <img
                  src={avatarImage}
                  alt={displayName}
                  className="w-full h-full rounded-2xl object-cover border-2 border-gray-900 shadow-sm"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-[#18191d] border-2 border-black flex items-center justify-center text-[#e5fc73] font-black text-xl shadow-sm uppercase select-none">
                  {initials}
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                <ShieldCheck size={11} strokeWidth={3} />
              </div>
            </div>

            <h4 className="text-base font-black text-gray-950 m-0">{displayName}</h4>
            <p className="text-xs text-gray-500 mt-0.5 m-0 font-mono">{displayEmail}</p>

            {/* Details List */}
            <div className="bg-gray-50 rounded-2xl p-3.5 my-4 text-left text-xs space-y-2.5 text-gray-600 border border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Account Type:</span>
                <span className="text-gray-900 font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200 uppercase text-[10px] tracking-wider">
                  {isShopUser ? "Store Counter Operator" : storedRole}
                </span>
              </div>

              {storeInfo?.mallTitle && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Shopping Complex:</span>
                  <span className="text-gray-900 font-semibold truncate max-w-[200px]">
                    {storeInfo.mallTitle}
                  </span>
                </div>
              )}

              {isShopUser ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Counter Status:</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Live Queue Active</span>
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Complexes:</span>
                    <strong className="text-gray-900 font-semibold">{totalMalls}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Active Brand Desks:</span>
                    <strong className="text-emerald-600 font-semibold">{activeLicenses}</strong>
                  </div>
                </>
              )}
            </div>

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* TAB 2: SETTINGS & PASSWORD */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSettings} className="mt-3 flex flex-col gap-3 animate-in fade-in duration-200 text-left">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Store / Display Name & Staff Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Store / Display Name *
                </label>
                <div className="relative">
                  <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Apex Luxury Apparel"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Counter Staff Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@brand.com"
                    className="w-full pl-8 pr-3 py-2 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs font-medium outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Password Section Divider */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 mb-2">
                <KeyRound size={13} className="text-gray-700" />
                <span>Change Password</span>
              </div>

              {/* Current Password */}
              <div className="mb-2">
                <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-8 pr-8 py-2 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs font-medium outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 pr-8 py-2 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs font-medium outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5 uppercase tracking-wider">
                    Confirm New
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 pr-8 py-2 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs font-medium outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#111215] hover:bg-black text-white cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save size={13} className="text-[#e5fc73]" />
                <span>{isSaving ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

export default ProfileModal;
