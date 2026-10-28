import React from "react";
import { X, BookOpen } from "lucide-react";

const HelpModal = React.memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[28px] w-full max-w-md p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-gray-800" />
            <h3 className="text-base font-bold text-gray-900 m-0">RedCarpet Help & Guides</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
          <p className="font-medium text-gray-900">
            Welcome to the RedCarpet SuperAdmin Command Center:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-gray-600">
            <li>
              <strong>Register Complexes:</strong> Click the <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">+</code> button in the left dock to register a new shopping mall.
            </li>
            <li>
              <strong>Instant Subscription Toggle:</strong> Use the micro-switch on each mall card to immediately activate or suspend live TV displays and queue services.
            </li>
            <li>
              <strong>Manage Brand Stores:</strong> Click <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px]">Manage Stores</code> on any mall card to view its brand counters, menus, and queue directors.
            </li>
            <li>
              <strong>QR Studio:</strong> Access the QR icon in the dock to customize printable QR codes and table standees for customers.
            </li>
          </ul>
        </div>

        <div className="flex justify-end mt-5 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#111215] text-white px-5 py-2 rounded-full text-xs font-semibold cursor-pointer hover:bg-gray-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});

export default HelpModal;
