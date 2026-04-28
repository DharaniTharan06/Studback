"use client";
import Image from "next/image";
import { UploadCloud, Check } from "lucide-react";
import { useObjectUrl } from "@/hooks/use-object-url";
export function FileField({
  label,
  accept,
  file,
  onChange,
  required,
  disabled,
}: {
  label: string;
  accept: "image/*" | "video/*";
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
  disabled?: boolean;
}) {
  const preview = useObjectUrl(file);
  return (
    <label className="field">
      <span>
        {label}
        {required && " *"}
      </span>
      <span className="relative flex min-h-32 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-background p-4 text-center hover:bg-muted">
        {preview && accept === "image/*" ? (
          <Image
            src={preview}
            alt={`${label} preview`}
            width={320}
            height={160}
            unoptimized
            className="mb-2 max-h-32 w-auto rounded object-contain"
          />
        ) : file ? (
          <Check className="size-6 text-success" />
        ) : (
          <UploadCloud className="size-6 text-muted-foreground" />
        )}
        <span className="text-xs font-medium">
          {file
            ? file.name
            : `Choose ${accept === "image/*" ? "an image" : "a video"}, or drop it here`}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {file
            ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Click to replace`
            : accept === "image/*"
              ? "JPG, PNG, or WebP · up to 10 MB"
              : "MP4, WebM, or MOV"}
        </span>
        <input
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
          type="file"
          accept={accept}
          disabled={disabled}
          required={required && !file}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            if (
              selected &&
              !selected.type.startsWith(accept.split("/")[0] + "/")
            ) {
              event.target.setCustomValidity(
                `Choose ${accept === "image/*" ? "an image" : "a video"} file`
              );
              event.target.reportValidity();
              return;
            }
            if (
              selected &&
              accept === "image/*" &&
              selected.size > 10 * 1024 * 1024
            ) {
              event.target.setCustomValidity(
                "Images must be smaller than 10 MB"
              );
              event.target.reportValidity();
              return;
            }
            event.target.setCustomValidity("");
            onChange(selected);
            event.target.value = "";
          }}
        />
      </span>
    </label>
  );
}
