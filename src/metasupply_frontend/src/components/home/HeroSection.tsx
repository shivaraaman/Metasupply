import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowDown, ArrowRight } from "../icons";
import Reveal from "../Reveal";
import HeroCube from "./HeroCube";
import { scrollToSection } from "./scroll";

const HeroSection: React.FC<{ total: bigint | null }> = ({ total }) => {
  const { isAuthenticated } = useAuth();

  return (
    <section id="intro" className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 items-center overflow-hidden">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Reveal>
            <p className="eyebrow">Content provenance · Internet Computer</p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl">
              Every file deserves a <span className="gradient-text animate-gradient-pan bg-[length:200%_200%]">proof of origin.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass mt-8 max-w-xl rounded-2xl p-5">
              <p className="font-display text-lg text-white">
                meta·supply <span className="font-sans text-sm text-slate-400">/ˈmɛtə səˈplaɪ/ · noun</span>
              </p>
              <p className="mt-2 leading-relaxed text-slate-300">
                The traceable <span className="text-brand-cyan">supply chain</span> of a file's{" "}
                <span className="text-brand-magenta">metadata</span>: who made it, when, how (even which AI model,
                prompt and dataset), and every version since. Sealed on the blockchain, checkable by anyone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/verify" className="btn-primary px-7 py-3.5 text-base">
                Verify a file <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={isAuthenticated ? "/register" : "/login"} className="btn-ghost px-7 py-3.5 text-base">
                Register yours
              </Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              {[
                ["SHA-256", "fingerprint"],
                ["Immutable", "records"],
                ["Free", "to verify"],
                ...(total !== null ? [[total.toString(), "files sealed"]] : []),
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-xl font-bold text-white">{value}</dt>
                  <dd className="text-slate-400">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <HeroCube />
        </Reveal>
      </div>

      <button
        onClick={() => scrollToSection("start")}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-slate-400 hover:text-white sm:flex"
      >
        Explore
        <ArrowDown className="h-5 w-5 animate-bounce-soft" />
      </button>
    </section>
  );
};

export default HeroSection;
