"use client";

import { useEffect, useRef, useState, useCallback, useId, useMemo, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for cleaner tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// More flexible ID type and optional metadata support
export interface DropdownOption<T = unknown> {
  name: ReactNode;
  id: string | number;
  label: string;
  disabled?: boolean;
  metadata?: T;
}

interface SearchableDropdownProps<T extends DropdownOption> {
  /** Input label text */
  label?: string;
  /** Array of selectable options */
  options: T[];
  /** Currently selected option */
  value: T | null;
  /** Callback when selection changes */
  onChange: (option: T) => void;
  /** Placeholder text for empty state */
  placeholder?: string;
  /** Disable the entire dropdown */
  disabled?: boolean;
  /** Callback when disabled dropdown is clicked */
  onDisabledClick?: () => void;
  /** Custom error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom filter function */
  filterFn?: (option: T, searchTerm: string) => boolean;
  /** Custom class names */
  className?: string;
  /** Input name attribute */
  name?: string;
  /** Required field indicator */
  required?: boolean;
  /** Empty search results message */
  emptyMessage?: string;
  /** Maximum height of dropdown in pixels */
  maxHeight?: number;
}

export function SearchableDropdown<T extends DropdownOption>({
  label,
  options,
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
  onDisabledClick,
  error,
  helperText,
  loading = false,
  filterFn,
  className,
  name,
  required = false,
  emptyMessage = "No results found",
  maxHeight = 240,
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const labelId = useId();
  const errorId = useId();
  const helperId = useId();

  // Memoized filter logic
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    
    const term = searchTerm.toLowerCase().trim();
    return filterFn 
      ? options.filter((opt) => filterFn(opt, term))
      : options.filter((opt) => 
          opt.label.toLowerCase().includes(term) ||
          String(opt.id).toLowerCase().includes(term)
        );
  }, [options, searchTerm, filterFn]);

  // Reset highlight when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length, searchTerm]);

  // Close dropdown when options change (useful for dependent dropdowns)
  useEffect(() => {
    setIsOpen(false);
    setSearchTerm("");
  }, [options]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && filteredOptions[highlightedIndex]) {
          const selected = filteredOptions[highlightedIndex];
          if (!selected.disabled) {
            onChange(selected);
            setIsOpen(false);
            setSearchTerm("");
          }
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm("");
        inputRef.current?.blur();
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm("");
        }
        break;

      case "Home":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;

      case "End":
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
        }
        break;
    }
  }, [disabled, isOpen, filteredOptions, highlightedIndex, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleOptionSelect = useCallback((option: T) => {
    if (option.disabled) return;
    onChange(option);
    setIsOpen(false);
    setSearchTerm("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleContainerClick = () => {
    if (disabled) {
      onDisabledClick?.();
      return;
    }
    inputRef.current?.focus();
    setIsOpen(true);
  };

  const displayValue = isOpen ? searchTerm : value?.label ?? "";
  const hasError = !!error;
  const showHelper = !hasError && !!helperText;

  return (
    <div 
      ref={containerRef}
      className={cn("w-full flex flex-col gap-2", className)}
    >
      {/* Label */}
      {label && (
        <label 
          id={labelId}
          htmlFor={listboxId}
          className={cn(
            "text-sm font-medium",
            disabled ? "text-gray-400" : "text-gray-700",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </label>
      )}

      {/* Input Container - Styled like your input */}
      <div className="relative">
        <div
          onClick={handleContainerClick}
          className={cn(
            "relative flex items-center w-full rounded-xl border transition-all",
            "bg-gray-50 min-h-[24px]",
            disabled && "bg-gray-100 cursor-not-allowed opacity-60",
            !disabled && {
              "ring-2 ring-black border-black": isOpen,
              "border-gray-300 hover:border-gray-400": !isOpen && !hasError,
              "border-red-500": hasError,
            }
          )}
        >
          <input
            ref={inputRef}
            id={listboxId}
            name={name}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls={isOpen ? listboxId : undefined}
            aria-activedescendant={isOpen ? `${listboxId}-option-${highlightedIndex}` : undefined}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              showHelper && helperId
            )}
            aria-required={required}
            value={displayValue}
            placeholder={disabled ? "Select previous first" : placeholder}
            disabled={disabled || loading}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full bg-transparent px-5 py-4 text-base text-gray-900",
              "placeholder:text-gray-400",
              "focus:outline-none disabled:cursor-not-allowed",
              "rounded-xl"
            )}
          />

          {/* Chevron */}
          <div className="absolute right-4 flex items-center pointer-events-none">
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-gray-500 transition-transform duration-200",
                  isOpen && "rotate-180",
                  disabled && "opacity-30"
                )}
              />
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && !loading && (
          <div
            role="listbox"
            id={`${listboxId}-listbox`}
            className={cn(
              "absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200",
              "shadow-xl overflow-hidden"
            )}
            style={{ maxHeight }}
          >
            <div 
              className="overflow-y-auto"
              style={{ maxHeight: maxHeight - 2 }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-5 py-4 text-base text-gray-500 text-center">
                  {emptyMessage}
                </div>
              ) : (
                <ul className="py-2">
                  {filteredOptions.map((option, index) => {
                    const isSelected = value?.id === option.id;
                    const isHighlighted = index === highlightedIndex;
                    const isDisabled = option.disabled;

                    return (
                      <li
                        key={option.id}
                        id={`${listboxId}-option-${index}`}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={isDisabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleOptionSelect(option);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={cn(
                          "px-5 py-3 text-base cursor-pointer flex items-center justify-between gap-3",
                          "transition-colors",
                          isDisabled && "opacity-50 cursor-not-allowed bg-gray-50",
                          !isDisabled && {
                            "bg-gray-100": isHighlighted,
                            "bg-white": !isHighlighted,
                          }
                        )}
                      >
                        <span className={cn(
                          "truncate",
                          isSelected && "font-semibold text-gray-900",
                          !isSelected && "text-gray-700",
                          isDisabled && "text-gray-500"
                        )}>
                          {option.label}
                        </span>
                        
                        {isSelected && (
                          <Check className="w-5 h-5 text-black flex-shrink-0" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error or Helper Text */}
      {hasError && (
        <p 
          id={errorId}
          role="alert"
          className="text-sm text-red-600 font-medium"
        >
          {error}
        </p>
      )}
      
      {showHelper && (
        <p 
          id={helperId}
          className="text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

// Optional: Create a hook for dropdown state management
export function useDropdownState<T extends DropdownOption>(initialValue: T | null = null) {
  const [value, setValue] = useState<T | null>(initialValue);
  const [error, setError] = useState<string>();
  
  return {
    value,
    setValue,
    error,
    setError,
    reset: () => {
      setValue(initialValue);
      setError(undefined);
    },
    bind: {
      value,
      onChange: setValue,
      error,
    },
  };
}