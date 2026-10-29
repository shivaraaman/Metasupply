import React from "react";
import Reveal from "../Reveal";
import SocialLinks from "../SocialLinks";
import { LogoMark } from "../icons";
import { scrollToSection } from "./scroll";

const ConnectSection: React.FC = () => (
  <section id="connect" className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 flex-col overflow-hidden">
    <div className="grid-bg pointer-events-none absolute inset-0" />
    <div className="relative mx-auto flex w-full max-w-4xl flex-grow flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
      <Reveal>
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-cyan via-brand-violet to-brand-magenta opacity-40 blur-2xl" />
          <LogoMark className="relative h-24 w-24 animate-float" />
        </div>
      </Reveal>
      <Reveal delay={100}>
        <h2 className="mt-8 font-display text-6xl font-extrabold tracking-tight sm:text-8xl">
          <span className="gradient-text animate-gradient-pan bg-[length:200%_200%]">MetaSupply</span>
        </h2>
      </Reveal>
      <Reveal delay={200}>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
          Proof of origin for papers, files and AI-generated content. Fingerprints, authors, timestamps and AI recipes,
          sealed on the Internet Computer, so trust doesn't depend on taking anyone's word for it.
        </p>
      </Reveal>
      <Reveal delay={300} className="mt-10">
        <SocialLinks />
      </Reveal>
      <Reveal delay={400} className="mt-10">
        <a href="https://internetcomputer.org" target="_blank" rel="noreferrer" className="inline-block opacity-80 transition-opacity hover:opacity-100">
          <img src={`${import.meta.env.BASE_URL}logo2.svg`} alt="Built on the Internet Computer" className="h-10 rounded" />
        </a>
      </Reveal>
    </div>

    <div className="relative border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} MetaSupply. Built for the Internet Computer.</span>
        <button onClick={() => scrollToSection("intro")} className="hover:text-white">Back to top ↑</button>
      </div>
    </div>
  </section>
);

export default ConnectSection;
