import React, { useEffect, useRef, useState } from "react";

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");

/** Live SHA-256 of whatever the visitor types, highlighting which characters changed. */
const FingerprintPlayground: React.FC = () => {
  const [text, setText] = useState("MetaSupply proves where content came from.");
  const [hash, setHash] = useState("");
  const [changed, setChanged] = useState<Set<number>>(new Set());
  const previous = useRef("");

  useEffect(() => {
    let cancelled = false;
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then((digest) => {
      if (cancelled) return;
      const next = toHex(digest);
      const diff = new Set<number>();
      if (previous.current) {
        for (let i = 0; i < next.length; i++) if (next[i] !== previous.current[i]) diff.add(i);
      }
      previous.current = next;
      setHash(next);
      setChanged(diff);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  const rows = hash.match(/.{1,16}/g) ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div>
        <p className="eyebrow">Try it</p>
        <h3 className="mt-3 font-display text-3xl font-bold text-white">Change one letter. Watch everything change.</h3>
        <p className="mt-3 text-slate-400">
          This is the fingerprint MetaSupply stores. Edit the text, even by a single character, and the fingerprint
          changes almost completely. That's how a verifier knows instantly whether a file is the original.
        </p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-ink-900/70 p-5">
        <label htmlFor="playground" className="label">Your text</label>
        <textarea
          id="playground"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          className="input resize-none"
        />
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase tracking-widest">SHA-256</span>
          {changed.size > 0 && (
            <span>
              <span className="font-semibold text-brand-magenta">{changed.size}</span> of 64 characters changed
            </span>
          )}
        </div>
        <div className="mt-2 grid gap-1 rounded-xl bg-black/40 p-4 font-mono text-sm tracking-[0.18em] sm:text-base" aria-live="polite">
          {rows.map((row, r) => (
            <div key={r} className="break-all">
              {row.split("").map((char, c) => {
                const index = r * 16 + c;
                return (
                  <span
                    key={`${index}-${char}`}
                    className={changed.has(index) ? "text-brand-magenta transition-colors duration-700" : "text-slate-300"}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FingerprintPlayground;
