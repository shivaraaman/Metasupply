import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { isSha256 } from "../../services/documents";
import FileDrop from "../FileDrop";
import Reveal from "../Reveal";
import TiltCard from "../TiltCard";
import { ArrowDown, ArrowRight, Clock, Fingerprint, Layers, Search, Sparkles } from "../icons";
import { scrollToSection } from "./scroll";

const recorded = [
  { icon: Fingerprint, text: "SHA-256 fingerprint of the exact file" },
  { icon: Clock, text: "Date and time from the blockchain" },
  { icon: Sparkles, text: "AI model, tool, prompt and dataset" },
  { icon: Layers, text: "Every later version, linked in order" },
];

const IconBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-violet to-brand-magenta text-white shadow-[0_10px_30px_-10px_rgba(124,77,255,0.9)]">
    {children}
  </span>
);

const StartSection: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hash, setHash] = useState("");

  return (
    <section id="start" className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 items-center py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Start here</p>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Check a file, or <span className="gradient-text">seal your own</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Anyone can verify, no account needed. Creators log in once to register their work.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <TiltCard className="h-full p-6 sm:p-8" max={6}>
              <div className="flex items-start justify-between gap-4">
                <IconBadge><Search className="h-7 w-7" /></IconBadge>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  No login needed
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">Verify a file</h3>
              <p className="mt-2 text-slate-400">
                Drop any file to see whether it's registered, who registered it, when, and every version before and
                after it.
              </p>
              <div className="mt-6">
                <FileDrop
                  prompt="Drop a file to verify it"
                  onHashed={(result) =>
                    result && navigate(`/verify/${result.hash}`, { state: { fileName: result.file.name } })
                  }
                />
              </div>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate(`/verify/${hash.trim().toLowerCase()}`);
                }}
              >
                <input
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  placeholder="…or paste a fingerprint"
                  className="input font-mono text-sm"
                  aria-label="SHA-256 fingerprint"
                />
                <button type="submit" disabled={!isSha256(hash)} className="btn-ghost shrink-0 px-4" aria-label="Look up">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </TiltCard>
          </Reveal>

          <Reveal delay={120}>
            <TiltCard className="h-full p-6 sm:p-8" max={6}>
              <div className="flex items-start justify-between gap-4">
                <IconBadge><Fingerprint className="h-7 w-7" /></IconBadge>
                <span className="rounded-full border border-brand-violet/40 bg-brand-violet/10 px-3 py-1 text-xs font-medium text-violet-200">
                  Internet Identity
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">Register your work</h3>
              <p className="mt-2 text-slate-400">
                Seal a paper, image, track or AI output. Once recorded, nobody (not even you) can change or delete it.
              </p>
              <ul className="mt-6 space-y-3">
                {recorded.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-slate-200">
                    <Icon className="h-5 w-5 shrink-0 text-brand-cyan" />
                    {text}
                  </li>
                ))}
              </ul>
              <Link to={isAuthenticated ? "/register" : "/login"} className="btn-primary mt-6 w-full py-3.5 text-base">
                Register a document <ArrowRight className="h-4 w-4" />
              </Link>
            </TiltCard>
          </Reveal>
        </div>

        <div className="mt-12 flex justify-center">
          <button onClick={() => scrollToSection("how")} className="flex flex-col items-center gap-1 text-xs text-slate-400 hover:text-white">
            How it works
            <ArrowDown className="h-5 w-5 animate-bounce-soft" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StartSection;
