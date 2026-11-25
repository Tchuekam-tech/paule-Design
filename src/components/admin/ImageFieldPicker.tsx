import { useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Check } from 'lucide-react';
import type { MediaAssetItem } from '../../utils/adminHelpers';

interface ImageFieldPickerProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  mediaAssets: MediaAssetItem[];
  onUploadToLibrary?: (fileDataUrl: string, fileName: string) => Promise<void>;
  hint?: string;
}

/**
 * Compresses a user-selected image file on an offscreen canvas so it stays crisp
 * while fitting comfortably inside Firestore document bounds (~80-130 KB).
 */
export async function compressImageFileToDataUrl(
  file: File,
  maxWidth = 1080,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length > 220000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.56);
        }
        if (dataUrl.length > 245000) {
          reject(new Error('Image is still too large after compression. Please use a smaller image or external HTTPS URL.'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ImageFieldPicker({
  label,
  value,
  onChange,
  mediaAssets,
  onUploadToLibrary,
  hint,
}: ImageFieldPickerProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      onChange(dataUrl);
      if (onUploadToLibrary) {
        await onUploadToLibrary(dataUrl, file.name.replace(/\.[^.]+$/, ''));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium tracking-[0.14em] uppercase text-[#5F4A36]">
        {label}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Live Thumbnail Preview */}
        <div className="h-20 w-24 shrink-0 overflow-hidden border border-[#251C14]/15 bg-[#EFE9E0]">
          {value ? (
            <img
              src={value}
              alt={label}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#7A6047]/40">
              <ImageIcon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... or /src/assets/images/..."
            className="w-full border border-[#251C14]/20 bg-white px-3 py-2 text-xs text-[#251C14] placeholder:text-[#251C14]/40 focus:border-[#7A6047] focus:outline-none"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex items-center gap-1.5 border border-[#7A6047]/35 bg-[#F9F6F1] px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] uppercase text-[#5F4A36] transition-colors hover:bg-[#7A6047] hover:text-white cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Library</span>
            </button>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 border border-[#251C14]/20 bg-white px-3 py-1.5 text-[11px] font-medium tracking-[0.12em] uppercase text-[#251C14] transition-colors hover:border-[#7A6047] hover:text-[#7A6047] cursor-pointer disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{uploading ? 'Compressing...' : 'Upload'}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFileSelected(e.target.files?.[0])}
            />
          </div>

          {hint && <p className="text-[11px] text-[#5F4A36]/75">{hint}</p>}
          {uploadError && (
            <p className="text-[11px] text-red-700" role="alert">
              {uploadError}
            </p>
          )}
        </div>
      </div>

      {/* Media Library Picker Modal */}
      {libraryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Select image for ${label}`}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[#070605]/70 p-4 backdrop-blur-xs"
        >
          <div className="flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden border border-[#251C14]/15 bg-[#F6F2EC] text-[#251C14] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#251C14]/10 bg-white px-6 py-4">
              <div>
                <p className="text-[10px] tracking-[0.22em] uppercase text-[#7A6047]">
                  Studio Media Library
                </p>
                <h3 className="font-serif text-lg text-[#251C14]">
                  Select image for {label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                aria-label="Close media picker"
                className="inline-flex h-9 w-9 items-center justify-center border border-[#251C14]/15 text-[#251C14] hover:bg-[#251C14] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 overflow-y-auto p-6 sm:grid-cols-3">
              {mediaAssets.map((asset) => {
                const isSelected = asset.url === value;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onChange(asset.url);
                      setLibraryOpen(false);
                    }}
                    className={`group relative overflow-hidden border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#7A6047] ring-2 ring-[#7A6047]'
                        : 'border-[#251C14]/15 hover:border-[#7A6047]'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#E7DFD5]">
                      <img
                        src={asset.url}
                        alt={asset.alt || asset.label}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="bg-white p-2.5">
                      <p className="truncate text-xs font-medium text-[#251C14]">
                        {asset.label}
                      </p>
                      <p className="text-[10px] tracking-[0.14em] uppercase text-[#7A6047]">
                        {asset.category}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#7A6047] text-white shadow">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
