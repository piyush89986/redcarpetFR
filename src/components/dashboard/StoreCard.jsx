import React, { useCallback } from "react";
import { Store, Monitor, QrCode, Edit3, Trash2, Mail } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const StoreCard = React.memo(
  ({ item, onToggleStatus, onOpenCounter, onOpenQr, onEdit, onDelete }) => {
    const isActive = item.subscriptionStatus !== "inactive";

    const handleToggle = useCallback(
      (newChecked) => {
        if (onToggleStatus) onToggleStatus(item);
      },
      [item, onToggleStatus]
    );

    const handleCounter = useCallback(() => {
      onOpenCounter(item._id);
    }, [item._id, onOpenCounter]);

    const handleQr = useCallback(() => {
      onOpenQr(item);
    }, [item, onOpenQr]);

    const handleEdit = useCallback(() => {
      onEdit(item);
    }, [item, onEdit]);

    const handleDelete = useCallback(() => {
      onDelete(item);
    }, [item, onDelete]);

    return (
      <div className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 hover:border-gray-300 rounded-[22px] p-4 sm:p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between h-full group">
        <div>
          <div className="flex items-start gap-3.5">
            {/* Store Avatar / Logo */}
            <div className="w-14 h-14 min-w-[56px] rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name || "Store"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="text-base font-extrabold text-gray-800 bg-[#e5fc73]/30 w-full h-full flex items-center justify-center">
                  {(item.name || "S").substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Store Meta Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 truncate m-0">
                  {item.name || "Store Counter"}
                </h3>

                {/* Minimalist Toggle Switch */}
                <ToggleSwitch
                  checked={isActive}
                  onChange={handleToggle}
                  title={isActive ? "Active (Click to suspend)" : "Inactive (Click to activate)"}
                />
              </div>

              <p className="text-xs text-gray-500 truncate mt-1 m-0">
                {item.description || "Official brand counter for VIP queues and passes."}
              </p>

              {item.email && (
                <div className="text-[11px] text-gray-400 truncate mt-1.5 flex items-center gap-1.5">
                  <Mail size={12} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600 font-medium truncate">{item.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200/60">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCounter}
              title="Launch Live Counter Queue"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#111215] hover:bg-gray-800 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              <Monitor size={13} />
              Counter
            </button>

            <button
              type="button"
              onClick={handleQr}
              title="View / Download QR Pass"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              <QrCode size={13} />
              QR Code
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleEdit}
              title="Edit Store"
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black cursor-pointer transition-colors"
            >
              <Edit3 size={13} />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Delete Store"
              className="w-8 h-8 rounded-full bg-white hover:bg-red-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 cursor-pointer transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.item === next.item &&
    prev.onToggleStatus === next.onToggleStatus &&
    prev.onOpenCounter === next.onOpenCounter &&
    prev.onOpenQr === next.onOpenQr &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete
);

export default StoreCard;
