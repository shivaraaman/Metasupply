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
    <div className="text-center">
      <QRCodeDisplay value={url} size={180} />
      <p className="text-sm text-gray-500 mt-2">Scan to verify this version</p>
      <button
        type="button"
        onClick={copy}
        className="mt-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md"
      >
        {copied ? "Link copied" : "Copy verification link"}
      </button>
    </div>
  );
};

export default ShareLink;
