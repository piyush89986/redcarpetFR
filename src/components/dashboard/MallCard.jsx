import React, { useCallback } from "react";
import { Building2, Store, Edit3, Trash2 } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const MallCard = React.memo(
  ({ mall, onToggleSubscription, onEdit, onDelete, onManageStores }) => {
    const isActive = mall.subscriptionStatus !== "inactive";

    const handleToggle = useCallback(
      (newCheckedState) => {
        onToggleSubscription(mall._id, mall.subscriptionStatus);
      },
      [mall._id, mall.subscriptionStatus, onToggleSubscription]
    );

    const handleManage = useCallback(() => {
      onManageStores(mall._id);
    }, [mall._id, onManageStores]);

    const handleEdit = useCallback(() => {
      onEdit(mall);
    }, [mall, onEdit]);

    const handleDelete = useCallback(() => {
      onDelete(mall._id, mall.title);
    }, [mall._id, mall.title, onDelete]);

    return (
      <div className="bg-[#fafbfb] hover:bg-white border border-gray-200/80 hover:border-gray-300 rounded-[22px] p-4 sm:p-5 transition-all duration-200 hover:shadow-md flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start gap-3.5">
            {/* Mall Image / Logo */}
            <div className="w-14 h-14 min-w-[56px] rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              {mall.image ? (
                <img
                  src={mall.image}
                  alt={mall.title || "Mall"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <Building2 size={24} className="text-gray-400" />
              )}
            </div>

            {/* Mall Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 truncate m-0">
                  {mall.title || "Untitled Mall"}
                </h3>

                {/* Minimalist Toggle Switch */}
                <ToggleSwitch
                  checked={isActive}
                  onChange={handleToggle}
                  title={isActive ? "Active (Click to suspend)" : "Inactive (Click to activate)"}
                />
              </div>

              <p className="text-xs text-gray-500 truncate mt-1 m-0">
                {mall.description || "No location details provided"}
              </p>

              <div className="text-[11px] text-gray-400 truncate mt-1.5">
                Admin: <span className="text-gray-600 font-medium">{mall.email || "No email assigned"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200/60">
          <button
            type="button"
            onClick={handleManage}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111] hover:text-black bg-white hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs"
          >
            <Store size={13} />
            Manage Stores
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleEdit}
              title="Edit Mall"
              className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-black cursor-pointer transition-colors"
            >
              <Edit3 size={13} />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              title="Delete Mall"
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
    prev.mall === next.mall &&
    prev.onToggleSubscription === next.onToggleSubscription &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete &&
    prev.onManageStores === next.onManageStores
);

export default MallCard;
