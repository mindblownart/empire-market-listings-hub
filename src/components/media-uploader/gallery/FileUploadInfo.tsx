
import React from 'react';
import { Info } from 'lucide-react';

const FileUploadInfo: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-gray-700 space-y-1">
        <p>• Images: JPG, PNG, WebP format (max 10 images, automatically optimized to ≤1MB)</p>
        <p>• Video: One MP4 video file (≤20MB, 720p) or YouTube/Vimeo link</p>
        <p>• First image is always the Primary Image shown in search results</p>
        <p>• You can drag and drop to reorder images (video stays in slot 2)</p>
      </div>
    </div>
  );
};

export default FileUploadInfo;
