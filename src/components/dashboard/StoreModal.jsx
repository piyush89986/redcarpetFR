import React, { useState, useEffect } from "react";
import { X, Store } from "lucide-react";

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
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEdit && (!formData.password || formData.password.length < 4)) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (formData.password && formData.password !== formData.shopconpassword) {
      setError("Passwords do not match.");
      return;
    }

    onSubmit(formData, initialData);
  };

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-800">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 m-0">
                {isEdit ? "Edit Brand Store" : "Register New Brand Store"}
              </h3>
              <p className="text-xs text-gray-500 m-0 mt-0.5">
                {isEdit ? "Update store details & counter login" : "Add a brand counter to this mall"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
              placeholder="e.g. Ground Floor, West Wing - Fashion & Apparel"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Logo / Image URL
            </label>
            <input
              type="url"
              name="image"
              placeholder="https://example.com/store-logo.jpg"
              value={formData.image}
              onChange={handleChange}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isEdit ? "New Password (Optional)" : "Password *"}
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required={!isEdit}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isEdit ? "Confirm Password" : "Confirm Password *"}
              </label>
              <input
                type="password"
                name="shopconpassword"
                placeholder="••••••••"
                value={formData.shopconpassword}
                onChange={handleChange}
                required={!isEdit}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-black outline-none text-xs sm:text-sm font-medium transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 mt-4 pt-3 border-t border-gray-100">
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
