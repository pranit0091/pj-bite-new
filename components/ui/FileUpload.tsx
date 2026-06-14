"use client";

import { useState } from "react";
import { UploadCloud, X, Loader2, FileText, ExternalLink } from "lucide-react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  defaultUrl?: string;
  folder?: string;
  // Comma-separated MIME types or file extensions, e.g. ".pdf,application/pdf"
  accept?: string;
  // Max file size in MB
  maxMb?: number;
  label?: string;
}

export default function FileUpload({
  onUpload,
  defaultUrl = "",
  folder = "general",
  accept = ".pdf,application/pdf",
  maxMb = 10,
  label = "Upload PDF",
}: FileUploadProps) {
  const [url, setUrl] = useState<string>(defaultUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxMb * 1024 * 1024) {
      setError(`File size must be less than ${maxMb}MB`);
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url);
      onUpload(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUrl("");
    onUpload("");
  };

  return (
    <div className="w-full">
      {url ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-brand-bg/60 border border-[#E8E6E1] rounded-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-white rounded-lg border border-[#E8E6E1] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-brand-primary" />
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-text hover:text-brand-primary truncate inline-flex items-center gap-1.5">
              View uploaded file <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button type="button" onClick={clearFile} className="p-1.5 text-brand-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className={`relative flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-[#E8E6E1] rounded-xl bg-brand-bg/50 hover:bg-brand-primary/5 hover:border-brand-primary/30 transition-all cursor-pointer ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="w-9 h-9 bg-white rounded-lg border border-[#E8E6E1] flex items-center justify-center shrink-0">
            {isUploading ? <Loader2 className="w-4 h-4 text-brand-primary animate-spin" /> : <UploadCloud className="w-4 h-4 text-brand-primary" />}
          </div>
          <div>
            <p className="text-xs font-bold text-brand-text">{isUploading ? "Uploading…" : label}</p>
            <p className="text-[11px] text-brand-text-muted">PDF · up to {maxMb}MB</p>
          </div>
          <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={isUploading} />
        </label>
      )}
      {error && <p className="mt-2 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
