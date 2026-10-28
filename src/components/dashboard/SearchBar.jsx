import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

const SearchBar = React.memo(({ value = "", onChange, placeholder = "Search malls, cities, emails..." }) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef(null);

  // Sync if external value is changed (e.g., cleared by parent)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setLocalValue(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onChange) onChange(nextVal);
    }, 180);
  };

  const handleClear = () => {
    setLocalValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (onChange) onChange("");
  };

  return (
    <div className="relative w-full sm:w-72 lg:w-80">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="w-full bg-[#f6f8f7] border border-[#e5ebe7] focus:border-[#111] focus:bg-white rounded-full pl-9 pr-9 py-2 text-xs sm:text-[13px] font-medium outline-none transition-all placeholder:text-gray-400 shadow-2xs"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          title="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={10} strokeWidth={3} />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
