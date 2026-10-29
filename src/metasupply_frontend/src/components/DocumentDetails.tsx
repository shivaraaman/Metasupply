import React from "react";
import { Link } from "react-router-dom";
import {
  DATASET_LICENSE_LABELS,
  formatBytes,
  formatTimestamp,
  type DocumentRecord,
} from "../services/documents";

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="sm:grid sm:grid-cols-3 sm:gap-4 py-2">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="text-sm text-gray-900 sm:col-span-2 break-words">{children}</dd>
  </div>
);

const DocumentDetails: React.FC<{ document: DocumentRecord }> = ({ document: doc }) => (
  <dl className="divide-y divide-gray-100">
    <Row label="Title">{doc.title}</Row>
    <Row label="Author">{doc.author}</Row>
    {doc.description && <Row label="Description"><span className="whitespace-pre-wrap">{doc.description}</span></Row>}
    <Row label="Content type">
      {doc.content_type}
      {doc.ai && <span className="ml-2 text-xs font-medium bg-purple-100 text-purple-700 rounded px-2 py-0.5">AI-generated</span>}
    </Row>
    {doc.ai && (
      <>
        <Row label="AI model">{doc.ai.model}</Row>
        {doc.ai.tool && <Row label="Generation tool">{doc.ai.tool}</Row>}
        {doc.ai.prompt && <Row label="Prompt"><span className="whitespace-pre-wrap">{doc.ai.prompt}</span></Row>}
        {doc.ai.dataset && <Row label="Training dataset">{doc.ai.dataset}</Row>}
        <Row label="Dataset licence">{DATASET_LICENSE_LABELS[doc.ai.datasetLicense]}</Row>
      </>
    )}
    <Row label="Registered on">{formatTimestamp(doc.registered_at)}</Row>
    <Row label="Version">{doc.version}</Row>
    <Row label="File">{doc.file_name} ({formatBytes(doc.file_size)})</Row>
    <Row label="SHA-256 fingerprint"><span className="font-mono text-xs break-all">{doc.hash}</span></Row>
    <Row label="Registered by account"><span className="font-mono text-xs break-all">{doc.owner.toText()}</span></Row>
    {doc.previous_hash && (
      <Row label="Replaces version">
        <Link to={`/verify/${doc.previous_hash}`} className="font-mono text-xs text-blue-600 hover:underline break-all">
          {doc.previous_hash}
        </Link>
      </Row>
    )}
  </dl>
);

export default DocumentDetails;
