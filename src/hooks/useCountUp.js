// src/hooks/useCountUp.js
import { useEffect, useState } from "react";

export default function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16))); // Ensure step is at least 1
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);

  return count;
}
