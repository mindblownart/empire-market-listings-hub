
import React from 'react';
import { Loader2 } from 'lucide-react';

const PreviewLoading: React.FC = () => {
  return (
    <div className="flex-grow flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto" />
        <h2 className="mt-4 text-xl font-semibold">Loading preview...</h2>
        <p className="mt-2 text-gray-600">Preparing your business listing preview</p>
      </div>
    </div>
  );
};

export default PreviewLoading;
