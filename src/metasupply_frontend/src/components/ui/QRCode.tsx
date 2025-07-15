// src/components/ui/QRCode.tsx
import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCode: React.FC<QRCodeProps> = ({ value, size = 128 }) => {
  return (
    <div className="flex justify-center">
      <QRCodeSVG value={value} size={size} />
    </div>
  );
};

export default QRCode;
