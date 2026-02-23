"use client";

import React from "react";

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
}

const sizeMap: Record<AvatarSize, string> = {
  small: "w-8 h-8 text-xs",
  medium: "w-10 h-10 text-sm",
  large: "w-12 h-12 text-base",
};

export function Avatar({
  src,
  alt,
  initials,
  size = "medium",
  className = "",
  variant = "default",
  name,
  subtitle,
  onLogout,
  logoutLabel = "Se déconnecter",
}: AvatarProps) {
  const s = sizeMap[size];
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
