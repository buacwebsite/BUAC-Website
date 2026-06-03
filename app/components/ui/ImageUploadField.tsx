"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { HiOutlineCloudUpload, HiOutlineX } from "react-icons/hi";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  value?: File | string | null;
  onChange?: (value: File | string | null) => void;
  onBlur?: () => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  aspectRatio?: number;
  defaultImage?: string;
  isLoading?: boolean;
  maxSize?: number;
}

export function ImageUploadField({
  value,
  onChange,
  onBlur,
  className,
  disabled = false,
  error = false,
  aspectRatio = 1,
  defaultImage,
  isLoading = false,
  maxSize = 4 * 1024 * 1024,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof value === "string") {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(defaultImage || null);
    }
  }, [value, defaultImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file && file.size) {
      onChange?.(file);
      onBlur?.();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border-2 border-dashed border-text-muted/20 bg-text-muted/5 animate-pulse",
          className
        )}
        style={{ aspectRatio }}
      />
    );
  }

  return (
    <div className={cn("group relative", className)}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={disabled}
        aria-invalid={error}
      />

      <div
        className={cn(
          "relative overflow-hidden rounded-lg border-2 transition-all bg-background cursor-pointer",
          "hover:border-accent/60",
          error
            ? "border-red-500 hover:border-red-500"
            : "border-text-muted/30",
          disabled && "pointer-events-none opacity-50 cursor-not-allowed",
          previewUrl ? "border-solid" : "border-dashed"
        )}
        style={{ aspectRatio }}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            <Image
              fill
              src={previewUrl}
              alt="Preview"
              className="object-cover transition-opacity group-hover:opacity-60"
              sizes="(max-width: 768px) 100vw, 50vw"
            />

            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <HiOutlineCloudUpload className="w-8 h-8 text-white/85" />
              </div>
            )}

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background h-8 w-8 flex items-center justify-center shadow-md cursor-pointer"
                aria-label="Remove image"
              >
                <HiOutlineX className="w-4 h-4 text-text-secondary" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
            <HiOutlineCloudUpload className="w-8 h-8 text-text-muted" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-secondary">
                Click to upload
              </p>
              <p className="text-xs text-text-muted">
                {maxSize
                  ? `Max size: ${maxSize / 1024 / 1024} MB`
                  : "Supported formats: JPG, PNG, GIF"}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 text-xs text-red-500 bg-red-500/10 rounded-md">
            <HiOutlineExclamationCircle className="w-4 h-4" />
            Invalid image
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploadField;