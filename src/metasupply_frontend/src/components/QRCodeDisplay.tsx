import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 128, level = "M" }) => {
  if (!value) {
    return <div className="text-center text-red-500">No data provided for QR code.</div>;
  }
  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg">
      <QRCodeSVG value={value} size={size} level={level} />
    </div>
  );
};

export default QRCodeDisplay;
