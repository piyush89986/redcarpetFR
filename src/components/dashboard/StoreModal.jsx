import React, { useState, useEffect } from "react";
import { X, Store, Eye, EyeOff } from "lucide-react";

const initialStoreForm = {
  name: "",
  description: "",
  image: "",
  link: "a",
  email: "",
  password: "",
  shopconpassword: "",
  role: "shop admin",
};

const StoreModal = React.memo(({ isOpen, initialData = null, onClose, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState(initialStoreForm);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEdit = Boolean(initialData && (initialData._id || initialData.name));

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        image: initialData.image || "",
        link: initialData.link || "a",
        email: initialData.email || "",
        password: "",
        shopconpassword: "",
        role: initialData.role || "shop admin",
      });
    } else {
      setFormData(initialStoreForm);
    }
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [initialData, isOpen]);


  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setError("Store / Brand name is required.");
      return;
    }

    if (!formData.description?.trim()) {
      setError("Store description / category is required.");
      return;
    }

    const cleanEmail = (formData.email || "").trim().toLowerCase();
    if (!cleanEmail) {
      setError("Counter staff email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address (e.g. staff@brand.com).");
      return;
    }

    if (!isEdit && (!formData.password || formData.password.length < 4)) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (formData.password && formData.password !== formData.shopconpassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await onSubmit({ ...formData, email: cleanEmail }, initialData);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to save store.";
      setError(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className="relative bg-white rounded-[26px] sm:rounded-[28px] w-full max-w-2xl sm:max-w-3xl p-5 sm:p-6 shadow-2xl border border-white/80 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3.5 pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 shrink-0">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 m-0 leading-snug">
                {isEdit ? "Edit Brand Store" : "Register New Brand Store"}
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">
                {isEdit ? "Update store details & counter login" : "Add a brand counter to this mall"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 sm:p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Store / Brand Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Zara, Apple Store, Starbucks"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Store Description / Category *
              </label>
              <input
                type="text"
                name="description"
                placeholder="e.g. Ground Floor - Fashion & Apparel"
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Counter Staff Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="staff@brand.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Logo / Image URL <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="image"
                placeholder="https://example.com/store-logo.jpg"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isEdit ? "New Password (Optional)" : "Password *"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isEdit ? "Confirm Password" : "Confirm Password *"}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="shopconpassword"
                  placeholder="••••••••"
                  value={formData.shopconpassword}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-2.5 pt-2.5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full text-xs font-semibold bg-[#111215] hover:bg-gray-800 text-white cursor-pointer shadow-md transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Update Store" : "Register Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default StoreModal;
