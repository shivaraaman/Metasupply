import React, { useState } from "react";
import QRCodeDisplay from "./QRCodeDisplay";
import { verifyUrl } from "../services/documents";

/** QR code and copyable link that open the public verification page for `hash`. */
const ShareLink: React.FC<{ hash: string }> = ({ hash }) => {
  const url = verifyUrl(hash);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <QRCodeDisplay value={url} size={168} />
      <p className="mt-3 text-sm text-slate-400">Scan to verify this version</p>
      <button type="button" onClick={copy} className="btn-ghost btn-sm mt-3">
        {copied ? "Link copied ✓" : "Copy verification link"}
      </button>
    </div>
  );
};

export default ShareLink;
