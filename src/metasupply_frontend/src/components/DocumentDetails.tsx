import React from "react";
import { Link } from "react-router-dom";
import {
  DATASET_LICENSE_LABELS,
  formatBytes,
  formatTimestamp,
  type DocumentRecord,
} from "../services/documents";
import { Sparkles } from "./icons";

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm text-slate-400">{label}</dt>
    <dd className="mt-1 break-words text-sm text-slate-100 sm:col-span-2 sm:mt-0">{children}</dd>
  </div>
);

const DocumentDetails: React.FC<{ document: DocumentRecord }> = ({ document: doc }) => (
  <div className="space-y-6">
    <dl className="divide-y divide-white/[0.06]">
      <Row label="Title">{doc.title}</Row>
      <Row label="Author">{doc.author}</Row>
      {doc.description && <Row label="Description"><span className="whitespace-pre-wrap">{doc.description}</span></Row>}
      <Row label="Content type">
        {doc.content_type}
        {doc.ai && (
          <span className="ml-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-2 py-0.5 text-xs font-medium text-fuchsia-200">
            AI-generated
          </span>
        )}
      </Row>
      <Row label="Registered on">{formatTimestamp(doc.registered_at)}</Row>
      <Row label="Version">{doc.version}</Row>
      <Row label="File">{doc.file_name} ({formatBytes(doc.file_size)})</Row>
      <Row label="SHA-256 fingerprint"><span className="break-all font-mono text-xs text-brand-cyan">{doc.hash}</span></Row>
      <Row label="Registered by account"><span className="break-all font-mono text-xs">{doc.owner.toText()}</span></Row>
      {doc.previous_hash && (
        <Row label="Replaces version">
          <Link to={`/verify/${doc.previous_hash}`} className="break-all font-mono text-xs text-brand-cyan hover:underline">
            {doc.previous_hash}
          </Link>
        </Row>
      )}
    </dl>

    {doc.ai && (
      <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-brand-violet/10 to-brand-magenta/10 p-5">
        <p className="flex items-center gap-2 font-display font-semibold text-white">
          <Sparkles className="h-5 w-5 text-fuchsia-300" />
          How it was generated
        </p>
        <dl className="mt-2 divide-y divide-white/[0.06]">
          <Row label="AI model">{doc.ai.model}</Row>
          {doc.ai.tool && <Row label="Generation tool">{doc.ai.tool}</Row>}
          {doc.ai.prompt && <Row label="Prompt"><span className="whitespace-pre-wrap">{doc.ai.prompt}</span></Row>}
          {doc.ai.dataset && <Row label="Training dataset">{doc.ai.dataset}</Row>}
          <Row label="Dataset licence">{DATASET_LICENSE_LABELS[doc.ai.datasetLicense]}</Row>
        </dl>
      </div>
    )}
  </div>
);

export default DocumentDetails;
