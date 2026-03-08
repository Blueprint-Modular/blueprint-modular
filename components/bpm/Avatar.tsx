"use client";

import React, { useRef, useState } from "react";

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
  /** Affiche l'avatar dans un bloc type sidebar : avatar + name + subtitle, optionnellement bouton déconnexion */
  variant?: "default" | "sidebar";
  /** Nom affiché à côté de l'avatar (variant sidebar) */
  name?: string;
  /** Sous-titre (ex. email) sous le nom (variant sidebar) */
  subtitle?: string;
  /** Callback déconnexion (variant sidebar) ; si fourni, affiche un bouton */
  onLogout?: () => void;
  /** Libellé du bouton déconnexion (variant sidebar) */
  logoutLabel?: string;
  /** Active le mode édition : overlay crayon au survol, file picker au clic. */
  editable?: boolean;
  /** Callback appelé avec le File sélectionné. */
  onImageChange?: (file: File) => void;
}

const sizeMap: Record<AvatarSize, string> = {
  small: "w-8 h-8 text-xs",
  medium: "w-10 h-10 text-sm",
  large: "w-12 h-12 text-base",
};

const overlayIconSizeMap: Record<AvatarSize, number> = {
  small: 14,
  medium: 16,
  large: 20,
};

export function Avatar({
  src: srcProp,
  alt,
  initials,
  size = "medium",
  className = "",
  variant = "default",
  name,
  subtitle,
  onLogout,
  logoutLabel = "Se déconnecter",
  editable = false,
  onImageChange,
}: AvatarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const src = previewSrc ?? srcProp;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewSrc) URL.revokeObjectURL(previewSrc);
    const url = URL.createObjectURL(file);
    setPreviewSrc(url);
    onImageChange?.(file);
    e.target.value = "";
  };

  const s = sizeMap[size];
  const iconSize = overlayIconSizeMap[size];
  const showEditableOverlay = editable && variant === "default";

  const avatarEl = (
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

  if (variant !== "sidebar") {
    if (showEditableOverlay) {
      return (
        <span
          className={`bpm-avatar-editable-wrapper rounded-full overflow-hidden inline-block ${s}`.trim()}
          style={{ position: "relative" }}
        >
          {avatarEl}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden
            onChange={handleFileChange}
          />
          <span
            role="button"
            tabIndex={0}
            aria-label="Changer la photo"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
              cursor: "pointer",
            }}
            className="bpm-avatar-overlay"
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "0"; }}
            onFocus={(e) => { e.currentTarget.style.opacity = "1"; }}
            onBlur={(e) => { e.currentTarget.style.opacity = "0"; }}
          >
            <span style={{ color: "#fff", fontSize: iconSize }}>✎</span>
          </span>
        </span>
      );
    }
    return avatarEl;
  }

  return (
    <div className="bpm-avatar-sidebar flex flex-col gap-2 w-full" style={{ color: "var(--bpm-text-primary)" }}>
      <div className="flex items-center gap-3 min-w-0">
        {avatarEl}
        {(name != null || subtitle != null) && (
          <div className="min-w-0 flex-1">
            {name != null && (
              <p className="font-semibold truncate text-sm" style={{ color: "var(--bpm-text-primary)" }}>
                {name}
              </p>
            )}
            {subtitle != null && (
              <p className="text-xs truncate" style={{ color: "var(--bpm-text-secondary)" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      {onLogout != null && (
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2 rounded-lg text-sm font-normal border transition"
          style={{
            color: "var(--bpm-text-primary)",
            background: "var(--bpm-bg-primary)",
            borderColor: "var(--bpm-border)",
          }}
        >
          {logoutLabel}
        </button>
      )}
    </div>
  );
}
