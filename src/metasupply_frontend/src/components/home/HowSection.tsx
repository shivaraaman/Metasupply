import React from "react";
import Reveal from "../Reveal";
import TiltCard from "../TiltCard";
import { ArrowDown, FileCheck, Fingerprint, Lock, ShieldCheck } from "../icons";
import FingerprintPlayground from "./FingerprintPlayground";
import { scrollToSection } from "./scroll";

/** A fingerprint with a scanning beam passing over it. */
const RegisterVisual = () => (
  <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-brand-cyan/10">
    <Fingerprint className="h-16 w-16 text-brand-cyan" />
    <span className="absolute inset-x-2 h-0.5 animate-scan rounded-full bg-brand-cyan shadow-[0_0_14px_3px_rgba(41,171,226,0.8)]" />
  </div>
);

/** Three linked versions with a pulse travelling along the chain. */
const UpdateVisual = () => (
  <div className="relative mx-auto flex h-28 w-full max-w-[220px] items-center justify-between">
    <span className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-brand-cyan via-brand-violet to-brand-magenta" />
    <span className="absolute top-1/2 h-2 w-2 -translate-y-1/2 animate-travel-x rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.7)]" />
    {["v1", "v2", "v3"].map((v, i) => (
      <span
        key={v}
        className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-white/15 bg-ink-800 font-mono text-sm font-semibold text-white"
        style={{ boxShadow: `0 0 24px -6px ${["#29ABE2", "#7C4DFF", "#ED1E79"][i]}` }}
      >
        {v}
      </span>
    ))}
  </div>
);

/** A shield sending out ripples, like a confirmation. */
const VerifyVisual = () => (
  <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
    <span className="absolute h-20 w-20 animate-ripple rounded-full border-2 border-emerald-400/60" />
    <span className="absolute h-20 w-20 animate-ripple rounded-full border-2 border-emerald-400/60 [animation-delay:1s]" />
    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15">
      <ShieldCheck className="h-9 w-9 text-emerald-300" />
    </span>
  </div>
);

/** A file that stays inside the device boundary while only a fingerprint leaves. */
const PrivateVisual = () => (
  <div className="relative mx-auto flex h-28 w-full max-w-[220px] items-center justify-between">
    <span className="flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/20 text-[10px] text-slate-400">
      <FileCheck className="h-7 w-7 text-brand-amber" />
      your device
    </span>
    <span className="relative h-px flex-1 bg-white/10">
      <span className="absolute -top-1 h-2 w-2 animate-travel-x rounded-full bg-brand-amber shadow-[0_0_10px_3px_rgba(251,176,59,0.7)]" />
    </span>
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-amber/15">
      <Lock className="h-7 w-7 text-brand-amber" />
    </span>
  </div>
);

const steps = [
  {
    n: "01",
    title: "Register",
    text: "Your browser computes the file's SHA-256 fingerprint. It's sealed on-chain with the title, author, time and AI details.",
    visual: <RegisterVisual />,
  },
  {
    n: "02",
    title: "Update",
    text: "Changed the work? Register the new file as the next version. It links to the previous one, so the history is a single chain.",
    visual: <UpdateVisual />,
  },
  {
    n: "03",
    title: "Verify",
    text: "Anyone drops a file or scans its QR code to see when it was sealed, by whom, how it was made, and every version.",
    visual: <VerifyVisual />,
  },
  {
    n: "04",
    title: "Stay private",
    text: "The file never leaves your device. Only its fingerprint goes on-chain: enough to prove it, impossible to read it from.",
    visual: <PrivateVisual />,
  },
];

const HowSection: React.FC = () => (
  <section id="how" className="relative flex min-h-[calc(100svh-4rem)] scroll-mt-16 items-center py-20">
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Four steps. <span className="gradient-text">Zero trust required.</span>
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <Reveal key={step.n} delay={i * 100} className="h-full">
            <TiltCard className="h-full p-6">
              <div className="flex h-32 items-center">{step.visual}</div>
              <p className="mt-4 font-mono text-xs text-brand-cyan">{step.n}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="card mt-8">
        <FingerprintPlayground />
      </Reveal>

      <div className="mt-12 flex justify-center">
        <button onClick={() => scrollToSection("connect")} className="flex flex-col items-center gap-1 text-xs text-slate-400 hover:text-white">
          Connect
          <ArrowDown className="h-5 w-5 animate-bounce-soft" />
        </button>
      </div>
    </div>
  </section>
);

export default HowSection;
