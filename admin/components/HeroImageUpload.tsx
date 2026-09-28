"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_LABEL = "JPG, PNG, or WebP";

type HeroImageUploadProps = {
  value: string;
  previewUrl?: string;
  uploadPathPrefix: string;
  onChange: (value: string) => void;
};

function safeFilename(file: File) {
  const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
  const basename = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "hero-image";
  return `${basename}.${extension}`;
}

export function HeroImageUpload({ value, previewUrl: savedPreviewUrl, uploadPathPrefix, onChange }: HeroImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewUrl = localPreview || savedPreviewUrl || value;

  function clearLocalPreview() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");

    if (!ACCEPTED_TYPES.has(file.type)) {
      setError(`Please choose a ${ACCEPTED_LABEL} image.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("The image must be 5 MB or smaller.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    clearLocalPreview();
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const blob = await upload(`${uploadPathPrefix}/${safeFilename(file)}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      clearLocalPreview();
      onChange(blob.url);
    } catch {
      // Keep the existing URL and the rest of the event draft intact when upload fails.
      clearLocalPreview();
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage() {
    setError("");
    clearLocalPreview();
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="heroImageUpload" aria-busy={uploading}>
      <div className="heroImagePreview" data-empty={!previewUrl}>
        {/* Blob and local object URLs are displayed directly in this editing-only preview. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {previewUrl ? <img src={previewUrl} alt="Event hero preview" /> : <span>No hero image selected</span>}
        {uploading ? <span className="heroImageUploading">Uploading…</span> : null}
      </div>
      <div className="heroImageControls">
        <input
          ref={inputRef}
          className="visuallyHidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => void handleFile(event.target.files?.[0])}
          disabled={uploading}
          tabIndex={-1}
          aria-hidden="true"
        />
        <button className="secondaryButton" type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {previewUrl ? "Replace image" : "Choose image"}
        </button>
        {previewUrl ? <button className="textButton" type="button" onClick={removeImage} disabled={uploading}>Remove</button> : null}
        <small>Optional. {ACCEPTED_LABEL}; maximum 5 MB.</small>
      </div>
      {error ? <p className="uploadError" role="alert">{error}</p> : null}
    </div>
  );
}
