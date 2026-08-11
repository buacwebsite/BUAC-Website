"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[] | string[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: "dark" | "surface";
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
  disabled = false,
  className = "",
  variant = "dark",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === value,
  );

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const isDark = variant === "dark";

  const triggerClasses = isDark
    ? "border-white/15 bg-black/50 text-white"
    : "border-input-border bg-input-bg text-text-secondary";

  const panelClasses = isDark
    ? "border-white/15 bg-[#12141c] shadow-black/60"
    : "border-border bg-surface shadow-black/20";

  const optionBase = isDark
    ? "text-white/85 hover:bg-accent/25 hover:text-white"
    : "text-text-secondary hover:bg-accent/15 hover:text-accent";

  const optionActive = isDark
    ? "bg-accent text-white"
    : "bg-accent text-white";

  const placeholderColor = isDark ? "text-white/45" : "text-text-muted";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-12 sm:h-13 w-full items-center justify-between gap-2 rounded-xl border-2 px-4 text-left text-[15px] sm:text-sm font-light outline-none transition-all duration-200 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 ${triggerClasses} ${
          open ? "border-accent" : ""
        }`}
      >
        <span
          className={`truncate ${
            selectedOption ? "" : placeholderColor
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          {icon && (
            <span className={isDark ? "text-white/55" : "text-text-muted"}>
              {icon}
            </span>
          )}
          <HiChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } ${isDark ? "text-white/55" : "text-text-muted"}`}
          />
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-[200] max-h-64 overflow-y-auto rounded-xl border-2 p-1.5 shadow-2xl backdrop-blur-xl ${panelClasses}`}
        >
          {normalizedOptions.length === 0 ? (
            <p
              className={`px-3 py-2 text-sm ${
                isDark ? "text-white/50" : "text-text-muted"
              }`}
            >
              No options available
            </p>
          ) : (
            normalizedOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    isSelected ? optionActive : optionBase
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <HiCheck className="h-4 w-4 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}