import React, { useEffect, useState } from "react";
import { scrollToSection } from "./scroll";

export const SECTIONS = [
  { id: "intro", label: "Intro" },
  { id: "start", label: "Verify or register" },
  { id: "how", label: "How it works" },
  { id: "connect", label: "Connect" },
];

/** Side navigation showing which home section is on screen. */
const SectionDots: React.FC = () => {
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const { id } of SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 lg:flex" aria-label="Page sections">
      {SECTIONS.map(({ id, label }) => (
        <button key={id} onClick={() => scrollToSection(id)} className="group flex items-center justify-end gap-3" aria-label={label}>
          <span className="pointer-events-none rounded-full bg-ink-800/90 px-3 py-1 text-xs text-slate-200 opacity-0 transition-opacity group-hover:opacity-100">
            {label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === id
                ? "h-6 w-2.5 bg-gradient-to-b from-brand-cyan to-brand-magenta"
                : "h-2.5 w-2.5 bg-white/25 group-hover:bg-white/60"
            }`}
          />
        </button>
      ))}
    </nav>
  );
};

export default SectionDots;
