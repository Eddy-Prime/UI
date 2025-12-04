import React, { useEffect, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type Props = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
};

const RoundedSelect: React.FC<Props> = ({ options, value, onChange, placeholder = "Select...", ariaLabel = "select" }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between rounded-full border border-black-300 px-6 py-3 text-black-900 bg-black-50 focus:outline-none focus:ring-2 focus:ring-black-400 shadow-sm"
      >
        <span className="text-left truncate">{selected ? selected.label : placeholder}</span>
        <svg
          className={`w-5 h-5 ml-3 text-gray-600 transition-transform ${open ? "transform rotate-180" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-50 mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-lg max-h-60 overflow-auto py-1"
        >
          <li
            key="__empty__"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`px-4 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 ${value === "" ? "bg-gray-100 font-semibold" : ""}`}
          >
            {placeholder}
          </li>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${value === opt.value ? "bg-blue-600 text-white" : "text-gray-700"}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RoundedSelect;
