import React, { useState } from "react";
import { FormGroup } from "./FormGroup";
import { TradingPreferences } from "../../../../types/trading";

type TRiskTolerance = TradingPreferences[keyof TradingPreferences];

interface RangeFieldProps {
  label: string;
  helperText?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: TRiskTolerance) => void;
  suffix?: string;
}

export const RangeField: React.FC<RangeFieldProps> = ({
  label,
  helperText,
  value,
  min,
  max,
  step,
  onChange,
  suffix = "%",
}) => {
  const [percentage, setPercentage] = useState(
    ((value - min) * 100) / (max - min)
  );

  const handleRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    const newPercentage = ((newValue - min) * 100) / (max - min);
    setPercentage(newPercentage);
    onChange(newValue as TRiskTolerance);
  };

  return (
    <FormGroup label={label}>
      {helperText && <span className="helper-text">{helperText}</span>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleRangeInput}
        style={{
          background: `linear-gradient(to right, #00d0ff 0%, #00d0ff ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
        }}
      />
      <span className="range-value">
        {value}
        {suffix}
      </span>
    </FormGroup>
  );
};
