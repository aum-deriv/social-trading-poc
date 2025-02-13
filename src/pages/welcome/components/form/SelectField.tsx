import React, { useState, useRef, useEffect } from "react";
import { TradingPreferences } from "../../../../types/trading";
import { FormGroup } from "./FormGroup";

type TRiskTolerance = TradingPreferences[keyof TradingPreferences];

export interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: TRiskTolerance) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      selectRef.current &&
      !selectRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <FormGroup label={label}>
      <div className="custom-select" ref={selectRef}>
        <div
          className="select-selected"
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-controls="custom-select-options"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption?.label || "Select an option"}
          <span className="select-arrow"></span>
        </div>
        {isOpen && (
          <div
            className="select-options"
            role="listbox"
            id="custom-select-options"
          >
            {options.map((option) => (
              <div
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={`select-option ${
                  option.value === value ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(option.value as TRiskTolerance);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </FormGroup>
  );
};
