import React, { useEffect, useState } from "react";

const HEX = "0123456789abcdef";
const randomHash = (length: number) =>
  Array.from({ length }, () => HEX[Math.floor(Math.random() * 16)]).join("");

interface HashTickerProps {
  length?: number;
  className?: string;
}

/** A hex fingerprint that periodically scrambles and settles on a new value. */
const HashTicker: React.FC<HashTickerProps> = ({ length = 64, className = "" }) => {
  const [text, setText] = useState(() => randomHash(length));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame: number | undefined;
    const settle = () => {
      const target = randomHash(length);
      const start = performance.now();
      const step = (now: number) => {
        const settled = Math.floor(((now - start) / 700) * length);
        setText(target.slice(0, settled) + randomHash(Math.max(0, length - settled)));
        if (settled < length) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    const timer = window.setInterval(settle, 3500);
    return () => {
      window.clearInterval(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [length]);

  return <span className={`font-mono ${className}`}>{text}</span>;
};

export default HashTicker;
