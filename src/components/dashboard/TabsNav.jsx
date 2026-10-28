import React from "react";

const TabsNav = React.memo(({ tabs = [], activeTab, onTabChange, counts = {} }) => {
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0" aria-label="Dashboard views">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const count = counts[tab];

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#111215] text-white shadow-xs"
                : "text-gray-600 hover:text-black hover:bg-gray-100"
            }`}
          >
            {tab}
            {count !== undefined && (
              <span className={`ml-1.5 text-[11px] font-bold ${isActive ? "text-[#e5fc73]" : "text-gray-400"}`}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
});

export default TabsNav;
