'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      // Reset the file state after upload
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {file ? file.name : 'SVG, PNG, JPG or GIF (MAX. 800x400px)'}
          </p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
      </label>
      {file && (
        <Button onClick={handleUpload} className="mt-4">
          Upload File
        </Button>
      )}
    </div>
  );
}
