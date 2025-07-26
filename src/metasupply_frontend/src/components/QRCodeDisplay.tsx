// metasupply/src/metasupply_frontend/src/components/QRCodeDisplay.tsx

import React from 'react';
import QRCode from 'qrcode.react'; // Import the qrcode.react library

// Define props for the QRCodeDisplay component
interface QRCodeDisplayProps {
  value: string; // The data to encode in the QR code (e.g., JSON string of metadata, URL)
  size?: number; // Size of the QR code in pixels (default: 128)
  level?: 'L' | 'M' | 'Q' | 'H'; // Error correction level (default: 'M')
  fgColor?: string; // Foreground color (default: '#000000')
  bgColor?: string; // Background color (default: '#FFFFFF')
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 128, // Default size
  level = 'M', // Default error correction level
  fgColor = '#000000', // Default foreground color
  bgColor = '#FFFFFF', // Default background color
}) => {
  // Basic validation: if no value is provided, display a message.
  if (!value) {
    return <div className="text-center text-red-500">No data provided for QR code.</div>;
  }

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg">
      {/* QRCode component from qrcode.react */}
      <QRCode
        value={value} // The data to encode
        size={size} // Size of the QR code
        level={level} // Error correction level
        fgColor={fgColor} // Foreground color
        bgColor={bgColor} // Background color
        renderAs="svg" // Render as SVG for better scalability and quality
      />
    </div>
  );
};

export default QRCodeDisplay;
