import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialSeconds?: number;
  loop?: boolean;
  onCountdownComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds = 600,
  loop = true,
  onCountdownComplete,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          if (loop) {
            if (onCountdownComplete) onCountdownComplete();
            return initialSeconds;
          } else {
            clearInterval(interval);
            if (onCountdownComplete) onCountdownComplete();
            return 0;
          }
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds, loop, onCountdownComplete]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;

  return <span>{formattedTime}</span>;
};

export default CountdownTimer;
