"use client";

import { useEffect, useState } from "react";

const REFRESH_MS = 5000;

interface CameraPreviewProps {
  entityId: string;
  haUrl: string;
  haToken: string;
  className?: string;
}

/**
 * Fetches still image via our API proxy (same-origin, avoids CORS) and refreshes periodically.
 * The proxy calls HA /api/camera_proxy/<entity_id> with the stored token.
 */
export function CameraPreview({ entityId, haUrl, haToken, className = "" }: CameraPreviewProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!haUrl?.trim() || !haToken?.trim()) {
      setSrc(null);
      setError(true);
      return;
    }
    const url = `/api/camera-proxy?entityId=${encodeURIComponent(entityId)}`;

    let objectUrl: string | null = null;
    let cancelled = false;

    async function fetchImage() {
      try {
        const res = await fetch(url, {
          headers: {
            "X-HA-URL": haUrl,
            "X-HA-Token": haToken,
          },
          credentials: "same-origin",
        });
        if (cancelled || !res.ok) {
          if (!res.ok) setError(true);
          return;
        }
        const blob = await res.blob();
        if (cancelled) return;
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    fetchImage();
    const interval = setInterval(fetchImage, REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setSrc(null);
    };
  }, [entityId, haUrl, haToken]);

  if (error || !src) {
    return (
      <div
        className={`flex aspect-video w-full items-center justify-center rounded bg-neutral-200 text-center text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 ${className}`}
      >
        {error ? "Camera unavailable" : "Loading…"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Camera"
      className={`aspect-video w-full rounded bg-neutral-200 object-contain dark:bg-neutral-800 ${className}`}
    />
  );
}
