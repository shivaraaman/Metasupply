// metasupply/src/metasupply_frontend/src/components/LoadingSpinner.tsx

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Tailwind CSS for a simple spinning circle */}
      <div className="w-8 h-8 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
