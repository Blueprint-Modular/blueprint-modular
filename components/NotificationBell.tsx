"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNotificationHistory } from "@/contexts/NotificationHistoryContext";
import type { StoredNotification } from "@/contexts/NotificationHistoryContext";
import { Tooltip } from "@/components/bpm/Tooltip";
import "./NotificationBell.css";

function getDisplayNotification(notification: StoredNotification): StoredNotification {
  return notification;
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BellSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 -960 960 960"
    width="24px"
    fill="currentColor"
  >
    <path d="M200-209.23v-40h64.62v-316.92q0-78.39 49.61-137.89 49.62-59.5 125.77-74.11V-800q0-16.67 11.64-28.33Q463.28-840 479.91-840t28.36 11.67Q520-816.67 520-800v21.85q76.15 14.61 125.77 74.11 49.61 59.5 49.61 137.89v316.92H760v40H200Zm280-286.15Zm-.14 390.76q-26.71 0-45.59-18.98-18.89-18.98-18.89-45.63h129.24q0 26.85-19.03 45.73-19.02 18.88-45.73 18.88ZM304.62-249.23h350.76v-316.92q0-72.93-51.23-124.16-51.23-51.23-124.15-51.23-72.92 0-124.15 51.23-51.23 51.23-51.23 124.16v316.92Z" />
  </svg>
);

export function NotificationBell() {
  const { notifications, clearHistory } = useNotificationHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [animActive, setAnimActive] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const touchHandledRef = useRef(false);

  const [minLevel, setMinLevel] = useState<1 | 2 | 3>(() => {
    if (typeof window === "undefined") return 3;
    try {
      const v = parseInt(localStorage.getItem("bpm-notification-level") || "3", 10);
      return [1, 2, 3].includes(v) ? (v as 1 | 2 | 3) : 3;
    } catch {
      return 3;
    }
  });

  useEffect(() => {
    const h = () => {
      try {
        const v = parseInt(localStorage.getItem("bpm-notification-level") || "3", 10);
        setMinLevel([1, 2, 3].includes(v) ? (v as 1 | 2 | 3) : 3);
      } catch {
        setMinLevel(3);
      }
    };
    window.addEventListener("bpm-notification-level-updated", h);
    return () => window.removeEventListener("bpm-notification-level-updated", h);
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(typeof window !== "undefined" && window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!isMobile) return;
    let el = document.getElementById("notification-overlay-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "notification-overlay-root";
      document.body.appendChild(el);
    }
    setOverlayRoot(el);
  }, [isMobile]);

  useLayoutEffect(() => {
    if (!isOpen || isClosing) {
      setAnimActive(false);
      return;
    }
    if (isMobile) setAnimActive(true);
  }, [isOpen, isClosing, isMobile]);

  const requestClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  useEffect(() => {
    if (isOpen && !isClosing && !isMobile) {
      const id = requestAnimationFrame(() => setAnimActive(true));
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen, isClosing, isMobile]);

  useEffect(() => {
    if (isMobile || !isOpen) return;
    const h = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) requestClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isOpen, isMobile, requestClose]);

  const handleAnimEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "notification-dock-close") {
      setIsOpen(false);
      setIsClosing(false);
    }
  };

  const toggle = () => {
    if (!isOpen && !isClosing) setIsOpen(true);
    else if (isOpen && !isClosing) requestClose();
  };

  /** Sur mobile/PWA en portrait, le click peut ne pas se déclencher (z-index, délai tactile).
   * On force l'ouverture au touchEnd pour un comportement fiable. */
  const handleMobileBellTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    touchHandledRef.current = true;
    toggle();
  };

  const handleMobileBellClick = (e: React.MouseEvent) => {
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      e.preventDefault();
      return;
    }
    toggle();
  };

  const filteredNotifications = notifications.filter((n) => (n.level ?? 3) <= minLevel);
  const count = filteredNotifications.length;
  const recentNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 10);
  const hasMore = filteredNotifications.length > 10;

  const panelContent = (
    <>
      <div className="notification-popup-header">
        <h3>Notifications</h3>
        {count > 0 && (
          <Tooltip text="Effacer l'historique" position="bottom">
            <button
              type="button"
              className="notification-clear-button"
              onClick={() => {
                if (window.confirm("Voulez-vous effacer tout l'historique des notifications ?")) {
                  clearHistory();
                }
              }}
            >
              Effacer
            </button>
          </Tooltip>
        )}
      </div>
      <div className="notification-popup-content">
        {recentNotifications.length === 0 ? (
          <div className="notification-empty">
            <p>Aucune notification</p>
          </div>
        ) : (
          <>
            <div className="notification-list">
              {recentNotifications.map((notification) => {
                const display = getDisplayNotification(notification);
                const typeClass =
                  notification.type && ["success", "error", "warning", "info"].includes(notification.type)
                    ? `notification-item--${notification.type}`
                    : "notification-item--info";
                return (
                  <div key={notification.id} className={`notification-item ${typeClass}`}>
                    <div className="notification-item-content">
                      {display.pageName && (
                        <div className="notification-item-page">
                          {display.pageIcon &&
                            (() => {
                              let cleanIcon = display.pageIcon?.trim() ?? "";
                              if (
                                cleanIcon.startsWith("<svg") &&
                                cleanIcon.includes("</svg>")
                              ) {
                                try {
                                  const parser = new DOMParser();
                                  const doc = parser.parseFromString(cleanIcon, "image/svg+xml");
                                  if (!doc.querySelector("parsererror")) {
                                    return (
                                      <span
                                        className="notification-item-page-icon"
                                        dangerouslySetInnerHTML={{ __html: cleanIcon }}
                                      />
                                    );
                                  }
                                } catch {
                                  //
                                }
                              }
                              return null;
                            })()}
                          <span className="notification-item-page-name">{display.pageName}</span>
                        </div>
                      )}
                      {display.title && <div className="notification-item-title">{display.title}</div>}
                      <div className="notification-item-message">{display.message}</div>
                      <div className="notification-item-time">{formatTime(notification.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {hasMore && (
              <div className={showAll ? "notification-show-less" : "notification-show-more"}>
                <button
                  type="button"
                  className={showAll ? "notification-show-less-button" : "notification-show-more-button"}
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Afficher moins" : "Afficher plus"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  const popupClasses = `notification-popup${animActive ? " tooltip-dock-open" : ""}${isClosing ? " tooltip-dock-closing" : ""}`;

  const badgeCount = count > 99 ? "99+" : count;
  const isSingleDigit = count > 0 && count < 10;
  const badge =
    count > 0 ? (
      <span className={`notification-bell-badge${isSingleDigit ? " notification-bell-badge--single" : ""}`}>
        {badgeCount}
      </span>
    ) : null;

  if (isMobile) {
    const overlayEl =
      isOpen || isClosing ? (
        <div
          className="notification-overlay notification-overlay-portal"
          role="dialog"
          aria-label="Notifications"
          onClick={(e) => {
            if (e.target === e.currentTarget) requestClose();
          }}
        >
          <div
            className={popupClasses}
            onClick={(e) => e.stopPropagation()}
            onAnimationEnd={handleAnimEnd}
          >
            {panelContent}
          </div>
        </div>
      ) : null;

    return (
      <>
        <button
          type="button"
          className="dashboard-header-icon-btn notification-bell-mobile-btn"
          onClick={handleMobileBellClick}
          onTouchEnd={handleMobileBellTouch}
          aria-label="Notifications"
        >
          <BellSvg />
          {badge}
        </button>
        {overlayEl && overlayRoot && createPortal(overlayEl, overlayRoot)}
      </>
    );
  }

  const buttonEl = (
    <button
      type="button"
      className="notification-bell-button"
      onClick={toggle}
      aria-label="Notifications"
      title="Notifications"
    >
      <BellSvg />
      {badge}
    </button>
  );

  return (
    <div className="notification-bell-container" ref={bellRef}>
      {buttonEl}
      {(isOpen || isClosing) && (
        <div className={popupClasses} onAnimationEnd={handleAnimEnd}>
          {panelContent}
        </div>
      )}
    </div>
  );
}
