import React, { useState, useMemo } from "react";
import { X, ShieldCheck } from "lucide-react";

const ProfileModal = React.memo(({
  isOpen,
  onClose,
  totalMalls = 0,
  activeLicenses = 0,
  onSignOut,
  user = null
}) => {
  const [imgError, setImgError] = useState(false);

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

  const avatarImage = storedUser?.image || storedUser?.avatar || null;

  const initials = useMemo(() => {
    if (storedUser?.name) {
      return storedUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (storedRole === "admin") return "AD";
    return "ST";
  }, [storedUser, storedRole]);

  const displayName =
    storedUser?.name ||
    (storedRole === "admin"
      ? "Business Administrator"
      : "Store Counter Operator");

  const displayEmail =
    storedUser?.email ||
    (storedRole === "admin"
      ? "manager@business.com"
      : "staff@store.com");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-sm p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Profile Avatar / Image Display */}
        <div className="relative w-16 h-16 mx-auto mb-3">
          {avatarImage && !imgError ? (
            <img
              src={avatarImage}
              alt={displayName}
              className="w-full h-full rounded-full object-cover border-2 border-[#111] shadow-sm"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#18191d] border-2 border-black flex items-center justify-center text-[#e5fc73] font-black text-lg shadow-sm uppercase select-none">
              {initials}
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#e5fc73] border-2 border-white flex items-center justify-center text-[#111]">
            <ShieldCheck size={12} strokeWidth={3} />
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 m-0">{displayName}</h3>
        <p className="text-xs text-gray-500 mt-0.5 m-0">{displayEmail}</p>

        <div className="bg-gray-50 rounded-2xl p-3.5 my-4 text-left text-xs space-y-2 text-gray-600 border border-gray-100">
          <div className="flex justify-between items-center">
            <span>Account Role:</span>
            <span className="text-black font-bold bg-white px-2 py-0.5 rounded-md border border-gray-200">
              {storedRole} {storedRole === "superadmin" ? "(Root)" : ""}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Complexes:</span>
            <strong className="text-black font-semibold">{totalMalls}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span>Active Licenses:</span>
            <strong className="text-emerald-600 font-semibold">{activeLicenses}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-sm"
        >
          Sign Out of Portal
        </button>
      </div>
    </div>
  );
});

export default ProfileModal;
