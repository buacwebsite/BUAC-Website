"use client";

import * as React from "react";
import { HiX } from "react-icons/hi";
import {
  HiArrowDownCircle,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  status: "uploading" | "success" | "error";
  progress?: number;
  title: string;
  description: string;
  primaryButtonText: string;
  onPrimaryButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
  onClose?: () => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  status,
  progress = 0,
  title,
  description,
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
  onClose,
}) => {
  const statusStyles = {
    uploading: {
      border: "border-accent/40",
      iconColor: "text-accent",
      bar: "bg-accent",
    },
    success: {
      border: "border-emerald-500/40",
      iconColor: "text-emerald-500",
      bar: "bg-emerald-500",
    },
    error: {
      border: "border-red-500/40",
      iconColor: "text-red-500",
      bar: "bg-red-500",
    },
  } as const;

  const styles = statusStyles[status];

  const renderIcon = () => {
    const iconClass = cn("h-7 w-7 shrink-0", styles.iconColor);
    switch (status) {
      case "uploading":
        return <HiArrowDownCircle className={iconClass} />;
      case "success":
        return <HiCheckCircle className={iconClass} />;
      case "error":
        return <HiXCircle className={iconClass} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl",
        styles.border
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {renderIcon()}
          <div>
            <h3 className="text-sm font-bold text-text-secondary">{title}</h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <HiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {status === "uploading" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
            <span>Uploading...</span>
            <span className="font-semibold text-text-secondary">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-text-muted/15">
            <div
              className={cn("h-full transition-all duration-300", styles.bar)}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrimaryButtonClick}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors cursor-pointer"
        >
          {primaryButtonText}
        </button>
        {secondaryButtonText && (
          <button
            type="button"
            onClick={onSecondaryButtonClick}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-text-muted/30 text-text-muted hover:text-text-secondary hover:border-text-secondary transition-colors cursor-pointer"
          >
            {secondaryButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default UploadCard;