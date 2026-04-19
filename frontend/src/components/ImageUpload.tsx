import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  currentImageUrl?: string;
  isUploading?: boolean;
  accept?: string;
}

export function ImageUpload({
  onFileSelect,
  currentImageUrl,
  isUploading = false,
  accept = 'image/jpeg,image/png,image/webp',
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_MB = 5;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    },
    [onFileSelect, MAX_SIZE_BYTES]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const displayImage = preview ?? currentImageUrl;

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-warm-300 hover:border-primary-400 hover:bg-warm-50'
        } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload dog image"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
      >
        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="Dog preview"
              className="mx-auto max-h-48 rounded-xl object-cover"
            />
            {!isUploading && (
              <p className="mt-3 text-sm text-warm-500">
                Click or drag to replace image
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-warm-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-warm-700">
                Drag &amp; drop an image here
              </p>
              <p className="text-xs text-warm-400 mt-1">
                or click to browse &bull; JPEG, PNG, WebP &bull; Max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-500 border-t-transparent" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
