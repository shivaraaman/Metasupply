import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
}

/** QR code on a white tile, which scanners need even on a dark page. */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 128, level = "M" }) => {
  if (!value) {
    return <div className="text-center text-rose-300">No data provided for QR code.</div>;
  }
  return (
    <div className="rounded-2xl bg-white p-3 shadow-[0_10px_40px_-10px_rgba(124,77,255,0.6)]">
      <QRCodeSVG value={value} size={size} level={level} />
    </div>
  );
};

export default QRCodeDisplay;
