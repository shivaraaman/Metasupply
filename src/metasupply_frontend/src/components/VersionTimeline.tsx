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
  <ol className="relative border-l-2 border-blue-200 ml-3">
    {[...versions].reverse().map((doc, index) => {
      const isCurrent = doc.hash === current;
      return (
        <li key={doc.hash} className="mb-6 ml-6">
          <span
            className={`absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-white ${
              isCurrent ? "bg-green-500" : "bg-blue-400"
            }`}
          />
          <Link
            to={`/verify/${doc.hash}`}
            className={`block rounded-lg border p-4 transition-colors ${
              isCurrent ? "border-green-400 bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-800">Version {doc.version}</span>
              {index === 0 && (
                <span className="text-xs font-medium bg-blue-100 text-blue-700 rounded px-2 py-0.5">Latest</span>
              )}
              {isCurrent && (
                <span className="text-xs font-medium bg-green-100 text-green-700 rounded px-2 py-0.5">
                  This file
                </span>
              )}
            </div>
            <p className="text-gray-700 mt-1 break-words">{doc.title}</p>
            <p className="text-sm text-gray-500 mt-1">
              {formatTimestamp(doc.registered_at)} · by {doc.author} · {doc.content_type}
              {doc.ai && <> · AI: {doc.ai.model}</>}
            </p>
            <p className="text-xs text-gray-400 font-mono mt-1">{shortHash(doc.hash)}</p>
          </Link>
        </li>
      );
    })}
  </ol>
);

export default VersionTimeline;
