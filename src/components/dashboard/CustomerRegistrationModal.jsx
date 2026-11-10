import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  Ticket,
  ArrowRight,
  RotateCcw
} from "lucide-react";

const initialForm = {
  name: "",
  mobile: "",
  email: "",
};

const CustomerRegistrationModal = React.memo(({
  isOpen,
  onClose,
  onSubmit,
  storeName = "Store Counter",
}) => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [issuedToken, setIssuedToken] = useState(null); // When filled, displays success card

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
      setError("");
      setIssuedToken(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanName = formData.name.trim();
    const cleanMobile = formData.mobile.trim().replace(/\D/g, "");
    const cleanEmail = formData.email.trim();

    if (!cleanName || cleanName.length < 2) {
      setError("Please enter the customer's full name (at least 2 characters).");
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (cleanEmail) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(cleanEmail)) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        name: cleanName,
        mobile: cleanMobile,
        email: cleanEmail,
      });

      const tokenNumber = res?.token || res?.newInfo?.token || "Assigned";
      setIssuedToken({
        token: tokenNumber,
        name: cleanName,
        mobile: cleanMobile,
      });
    } catch (err) {
      console.error("Error registering walk-in customer:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to register customer. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNext = () => {
    setFormData(initialForm);
    setError("");
    setIssuedToken(null);
  };

  return (
    <div className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-[26px] sm:rounded-[30px] w-full max-w-md p-5 sm:p-7 shadow-2xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
              <UserPlus size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 m-0 leading-tight">
                Register Customer
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5">
                Issue a walk-in queue token for <strong className="text-gray-800 font-semibold">{storeName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* State 1: Success Confirmation Card */}
        {issuedToken ? (
          <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <CheckCircle2 size={34} strokeWidth={2.3} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles size={12} className="text-emerald-600" />
              <span>TOKEN GENERATED SUCCESSFULLY</span>
            </div>

            <h4 className="text-xl sm:text-2xl font-black text-gray-950 m-0 mb-1">
              {issuedToken.name}
            </h4>
            <p className="text-xs text-gray-500 font-mono mb-4">
              +91 {issuedToken.mobile}
            </p>

            {/* Token Badge */}
            <div className="bg-[#111215] text-white rounded-2xl p-4 sm:p-5 mb-5 shadow-lg relative overflow-hidden">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
                <Ticket size={13} className="text-[#e5fc73]" />
                <span>Live Queue Token Number</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#e5fc73] font-mono my-1">
                #{issuedToken.token}
              </div>
              <p className="text-[11px] text-gray-300 m-0 mt-1">
                Added to today's active queue. Visible on the TV screen when called.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleResetForNext}
                className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Register Next Guest</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold bg-[#111215] hover:bg-black text-white cursor-pointer transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Done &amp; View Queue</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ) : (
          /* State 2: Input Registration Form */
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold leading-relaxed">
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Customer Full Name *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Rahul Sharma, Priya Mehta"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="tel"
                  name="mobile"
                  maxLength={10}
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400 font-mono"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 m-0">
                Used to dispatch SMS alerts when their token is called.
              </p>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Email Address
                </label>
                <span className="text-[11px] text-gray-400">Optional</span>
              </div>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="customer@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50/70 border border-gray-300 focus:border-black focus:bg-white rounded-xl text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2.5 mt-3 pt-3 border-t border-gray-100">
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
                className="px-6 py-2 rounded-full text-xs font-bold bg-[#111215] hover:bg-black text-white cursor-pointer shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Ticket size={13} className="text-[#e5fc73]" />
                <span>{isSubmitting ? "Issuing Token..." : "Issue Queue Token"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

export default CustomerRegistrationModal;

