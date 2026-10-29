import React, { useEffect, useRef } from "react";
import { Clock, Fingerprint, QrCode, ShieldCheck, Sparkles } from "../icons";
import HashTicker from "./HashTicker";

const chips = [
  { text: "SHA-256 sealed", className: "left-0 top-6 sm:-left-6", delay: "0s" },
  { text: "v1 → v2 linked", className: "right-0 top-16 sm:-right-8", delay: "1.2s" },
  { text: "Model · GPT-4o", className: "bottom-20 left-2 sm:-left-10", delay: "2.1s" },
  { text: "Dataset · Licensed", className: "bottom-6 right-4 sm:-right-4", delay: "0.6s" },
];

const Face: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="cube-face text-white">{children}</div>
);

/** The hero's 3D block: a slowly spinning cube that also tilts toward the pointer. */
const HeroCube: React.FC = () => {
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!tilt.current || e.pointerType === "touch") return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      tilt.current.style.transform = `rotateX(${-y * 18}deg) rotateY(${x * 24}deg)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="cube-scene relative mx-auto flex h-[340px] w-full max-w-[460px] items-center justify-center sm:h-[460px]">
      {/* Glow under the block */}
      <div className="absolute h-64 w-64 rounded-full bg-gradient-to-tr from-brand-cyan/40 via-brand-violet/40 to-brand-magenta/40 blur-3xl" />

      {/* Orbit rings */}
      <div className="orbit h-[300px] w-[300px] sm:h-[380px] sm:w-[380px]">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-brand-cyan shadow-[0_0_16px_4px_rgba(41,171,226,0.7)]" />
      </div>
      <div className="orbit h-[360px] w-[360px] [animation-direction:reverse] [animation-duration:26s] sm:h-[450px] sm:w-[450px]">
        <span className="absolute -bottom-1.5 left-1/3 h-2.5 w-2.5 rounded-full bg-brand-magenta shadow-[0_0_14px_4px_rgba(237,30,121,0.7)]" />
      </div>

      <div ref={tilt} className="transition-transform duration-300 ease-out [transform-style:preserve-3d]">
        <div className="cube">
          <Face>
            <Fingerprint className="h-16 w-16 sm:h-20 sm:w-20" />
            <span className="font-mono text-xs tracking-widest text-white/80">SHA-256</span>
          </Face>
          <Face>
            <span className="px-5 text-center text-[10px] leading-relaxed text-white/85 sm:text-xs">
              <HashTicker length={48} className="break-all" />
            </span>
          </Face>
          <Face>
            <QrCode className="h-16 w-16 sm:h-20 sm:w-20" />
            <span className="text-xs text-white/80">Scan to verify</span>
          </Face>
          <Face>
            <Clock className="h-14 w-14 sm:h-16 sm:w-16" />
            <span className="text-xs text-white/80">Timestamped on-chain</span>
          </Face>
          <Face>
            <Sparkles className="h-14 w-14" />
            <span className="text-xs text-white/80">AI recipe recorded</span>
          </Face>
          <Face>
            <ShieldCheck className="h-14 w-14" />
            <span className="text-xs text-white/80">Tamper-proof</span>
          </Face>
        </div>
      </div>

      {chips.map((chip) => (
        <div
          key={chip.text}
          className={`glass absolute animate-float rounded-full px-3 py-1.5 font-mono text-[11px] text-slate-200 shadow-lg sm:text-xs ${chip.className}`}
          style={{ animationDelay: chip.delay }}
        >
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
          {chip.text}
        </div>
      ))}
    </div>
  );
};

export default HeroCube;
