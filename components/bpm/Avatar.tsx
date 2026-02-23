"use client";

import React from "react";

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  small: "w-8 h-8 text-xs",
  medium: "w-10 h-10 text-sm",
  large: "w-12 h-12 text-base",
};

export function Avatar({ src, alt, initials, size = "medium", className = "" }: AvatarProps) {
  const s = sizeMap[size];
  return (
    <span
      className={`bpm-avatar inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ${s} ${className}`.trim()}
      role="img"
      aria-label={alt ?? (initials ? `Avatar ${initials}` : "Avatar")}
      style={{
        background: "var(--bpm-bg-secondary)",
        color: "var(--bpm-text-primary)",
      }}
    >
      {src ? (
        <img src={src} alt={alt ?? ""} className="bpm-avatar-img w-full h-full object-cover" />
      ) : (
        <span className="bpm-avatar-initials font-medium">{initials ?? "?"}</span>
      )}
    </span>
  );
}
