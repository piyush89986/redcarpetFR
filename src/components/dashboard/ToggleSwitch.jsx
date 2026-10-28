import React from "react";

const ToggleSwitch = React.memo(({ checked, onChange, title = "Toggle status", disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onChange) onChange(!checked);
      }}
      title={title}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-[#18191d]" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-4 bg-[#e5fc73]" : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
});

export default ToggleSwitch;
