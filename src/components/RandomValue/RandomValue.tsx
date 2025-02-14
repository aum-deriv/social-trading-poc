import React, { useState, useEffect } from "react";

interface RandomValueProps {
  min?: number;
  max?: number;
  interval?: number;
}

const RandomValue: React.FC<RandomValueProps> = ({
  min = 0,
  max = 5,
  interval = 1000,
}) => {
  const [value, setValue] = useState<number>(
    parseFloat((Math.random() * (max - min) + min).toFixed(2))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newValue = parseFloat(
        (Math.random() * (max - min) + min).toFixed(2)
      );
      setValue(newValue);
    }, interval);

    return () => clearInterval(timer);
  }, [min, max, interval]);

  return <span>{value.toFixed(2)}</span>;
};

export default RandomValue;
