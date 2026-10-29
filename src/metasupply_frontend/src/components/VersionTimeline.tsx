import React from "react";
import { Link } from "react-router-dom";
import { formatTimestamp, shortHash, type DocumentRecord } from "../services/documents";

interface VersionTimelineProps {
  versions: DocumentRecord[];
  /** Hash to highlight, e.g. the one being verified. */
  current?: string;
}

/** Every version of a document, newest at the top. */
const VersionTimeline: React.FC<VersionTimelineProps> = ({ versions, current }) => (
  <ol className="relative ml-3 border-l border-transparent [border-image:linear-gradient(to_bottom,#29ABE2,#7C4DFF,#ED1E79)_1]">
    {[...versions].reverse().map((doc, index) => {
      const isCurrent = doc.hash === current;
      return (
        <li key={doc.hash} className="mb-5 ml-6 last:mb-0">
          <span
            className={`absolute -left-[7px] mt-5 h-3.5 w-3.5 rounded-full ring-4 ring-ink-950 ${
              isCurrent ? "bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]" : "bg-brand-violet"
            }`}
          />
          <Link
            to={`/verify/${doc.hash}`}
            className={`block rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
              isCurrent
                ? "border-emerald-400/40 bg-emerald-400/[0.07]"
                : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-semibold text-white">Version {doc.version}</span>
              {index === 0 && (
                <span className="rounded-full bg-brand-cyan/15 px-2 py-0.5 text-xs font-medium text-sky-200">Latest</span>
              )}
              {isCurrent && (
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-200">This file</span>
              )}
            </div>
            <p className="mt-1 break-words text-slate-200">{doc.title}</p>
            <p className="mt-1 text-sm text-slate-400">
              {formatTimestamp(doc.registered_at)} · by {doc.author} · {doc.content_type}
              {doc.ai && <> · AI: {doc.ai.model}</>}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500">{shortHash(doc.hash)}</p>
          </Link>
        </li>
      );
    })}
  </ol>
);

export default VersionTimeline;
