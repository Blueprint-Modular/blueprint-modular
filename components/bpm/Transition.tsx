"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import "./Transition.css";

export type TransitionVariant = "fade" | "shimmer" | "border" | "grid";

export interface TransitionProps {
  /** Index de la page / vue active (0-based). */
  activeIndex: number;
  /** Variant de transition : fade (slide), shimmer, border, grid. */
  variant?: TransitionVariant;
  /** Enfants : tableau de nœuds (une « page » par entrée). */
  children: ReactNode[];
  /** Durée de la transition fade (ms). Défaut 380. */
  duration?: number;
  /** Callback à la fin de la transition. */
  onTransitionEnd?: () => void;
  className?: string;
}

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const EASE_OUT = "cubic-bezier(0.4, 0, 0.6, 1)";

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function Transition({
  activeIndex,
  variant = "fade",
  children,
  duration = 380,
  onTransitionEnd,
  className = "",
}: TransitionProps) {
  const prevIndexRef = useRef(activeIndex);
  const [fromIndex, setFromIndex] = useState(activeIndex);
  const [toIndex, setToIndex] = useState(activeIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const btTopRef = useRef<HTMLDivElement>(null);
  const btRightRef = useRef<HTMLDivElement>(null);
  const btBottomRef = useRef<HTMLDivElement>(null);
  const btLeftRef = useRef<HTMLDivElement>(null);
  const gridMaskRef = useRef<HTMLDivElement>(null);

  const setStyle = useCallback((el: HTMLElement | null, props: Record<string, string>) => {
    if (!el) return;
    Object.assign(el.style, props);
  }, []);

  const clearStyle = useCallback((el: HTMLElement | null, ...keys: string[]) => {
    if (!el) return;
    keys.forEach((k) => el.style.removeProperty(k));
  }, []);

  useEffect(() => {
    if (activeIndex === prevIndexRef.current) return;
    const from = prevIndexRef.current;
    const to = activeIndex;
    prevIndexRef.current = activeIndex;
    setFromIndex(from);
    setToIndex(to);
    setIsTransitioning(true);

    const pFrom = fromRef.current;
    const pTo = toRef.current;
    const dir = to > from ? 1 : -1;

    const runFade = async () => {
      setStyle(pTo, {
        opacity: "0",
        transform: `translateY(${dir * 14}px)`,
        transition: "none",
      });
      await wait(10);
      const dur = `${duration}ms`;
      setStyle(pFrom, {
        transition: `opacity ${dur} ${EASE}, transform ${dur} ${EASE}`,
        opacity: "0",
        transform: `translateY(${dir * -8}px)`,
      });
      setStyle(pTo, {
        transition: `opacity ${dur} ${EASE}, transform ${dur} ${EASE}`,
        opacity: "1",
        transform: "translateY(0)",
      });
      await wait(duration + 20);
      [pFrom, pTo].forEach((el) => {
        clearStyle(el, "transition", "opacity", "transform");
      });
      setFromIndex(activeIndex);
      setToIndex(activeIndex);
      setIsTransitioning(false);
      onTransitionEnd?.();
    };

    const runShimmer = async () => {
      const ov = overlayRef.current;
      const line = shimmerRef.current;
      if (!ov || !line) return;
      ov.style.display = "";
      setStyle(line, { transition: "none", transform: "translateX(-100%)" });
      await wait(10);
      setStyle(line, { transition: "transform 0.55s " + EASE_OUT });
      line.style.transform = "translateX(100%)";
      await wait(260);
      setStyle(pFrom, { opacity: "0", transition: "opacity 0.18s ease" });
      setStyle(pTo, { opacity: "0", transition: "none" });
      await wait(20);
      setStyle(pTo, { opacity: "1", transition: "opacity 0.22s ease" });
      await wait(320);
      [pFrom, pTo].forEach((el) => clearStyle(el, "opacity", "transition"));
      ov.style.display = "none";
      clearStyle(line, "transition", "transform");
      setFromIndex(activeIndex);
      setToIndex(activeIndex);
      setIsTransitioning(false);
      onTransitionEnd?.();
    };

    const runBorder = async () => {
      const ov = overlayRef.current;
      const top = btTopRef.current;
      const right = btRightRef.current;
      const bottom = btBottomRef.current;
      const left = btLeftRef.current;
      if (!ov || !top || !right || !bottom || !left) return;
      ov.style.display = "";
      const segDur = 160;
      [top, right, bottom, left].forEach((el) =>
        setStyle(el, { transition: "none", width: "0", height: "0" })
      );
      setStyle(top, { width: "0" });
      setStyle(right, { height: "0" });
      setStyle(bottom, { width: "0" });
      setStyle(left, { height: "0" });
      await wait(10);
      const tr = `${segDur}ms ${EASE_OUT}`;
      setStyle(top, { transition: `width ${tr}`, width: "100%" });
      await wait(segDur);
      setStyle(right, { transition: `height ${tr}`, height: "100%" });
      await wait(segDur);
      setStyle(pFrom, { opacity: "0", transition: "opacity 0.15s ease" });
      setStyle(pTo, { opacity: "0", transition: "none" });
      await wait(20);
      setStyle(pTo, { opacity: "1", transition: "opacity 0.2s ease" });
      setStyle(bottom, { transition: `width ${tr}`, width: "100%" });
      await wait(segDur);
      setStyle(left, { transition: `height ${tr}`, height: "100%" });
      await wait(segDur);
      setStyle(ov, { transition: "opacity 0.25s ease", opacity: "0" });
      await wait(280);
      [pFrom, pTo].forEach((el) => clearStyle(el, "opacity", "transition"));
      ov.style.display = "none";
      clearStyle(ov, "opacity", "transition");
      [top, right, bottom, left].forEach((el) =>
        clearStyle(el, "transition", "width", "height")
      );
      setFromIndex(activeIndex);
      setToIndex(activeIndex);
      setIsTransitioning(false);
      onTransitionEnd?.();
    };

    const runGrid = async () => {
      const ov = overlayRef.current;
      const mask = gridMaskRef.current;
      if (!ov || !mask) return;
      ov.style.display = "";
      setStyle(mask, { transition: "none", opacity: "0" });
      await wait(10);
      setStyle(mask, { transition: "opacity 0.18s ease", opacity: "1" });
      await wait(200);
      setStyle(pTo, { opacity: "0", filter: "blur(4px)", transition: "none" });
      setStyle(pFrom, { opacity: "0" });
      await wait(30);
      setStyle(pTo, {
        opacity: "1",
        filter: "blur(0px)",
        transition: "opacity 0.25s ease, filter 0.3s ease",
      });
      setStyle(mask, { transition: "opacity 0.35s ease", opacity: "0" });
      await wait(380);
      [pFrom, pTo].forEach((el) =>
        clearStyle(el, "opacity", "filter", "transition")
      );
      ov.style.display = "none";
      clearStyle(mask, "opacity", "transition");
      setFromIndex(activeIndex);
      setToIndex(activeIndex);
      setIsTransitioning(false);
      onTransitionEnd?.();
    };

    const fns = {
      fade: runFade,
      shimmer: runShimmer,
      border: runBorder,
      grid: runGrid,
    };
    fns[variant]();
  }, [activeIndex, variant, duration, onTransitionEnd, setStyle, clearStyle]);

  const pages = Array.isArray(children) ? children : [children];
  const lastIndex = Math.max(0, pages.length - 1);
  const safeFrom = Math.min(fromIndex, lastIndex);
  const safeTo = Math.min(toIndex, lastIndex);
  const showFrom = isTransitioning && fromIndex !== toIndex;

  return (
    <div
      className={`bpm-transition bpm-transition--${variant} ${className}`.trim()}
      aria-busy={isTransitioning}
    >
      {showFrom && (
        <div
          ref={fromRef}
          className="bpm-transition-page bpm-transition-page--out"
          aria-hidden
        >
          {pages[safeFrom]}
        </div>
      )}
      <div
        ref={toRef}
        className="bpm-transition-page bpm-transition-page--in"
        style={!showFrom ? undefined : { position: "absolute", inset: 0 }}
      >
        {pages[safeTo]}
      </div>

      {variant === "shimmer" && isTransitioning && (
        <div
          ref={overlayRef}
          className="bpm-transition-overlay"
          aria-hidden
        >
          <div ref={shimmerRef} className="bpm-transition-shimmer-line" />
        </div>
      )}

      {variant === "border" && isTransitioning && (
        <div
          ref={overlayRef}
          className="bpm-transition-overlay bpm-transition-border-trace"
          aria-hidden
        >
          <div className="bpm-transition-bt-line bpm-transition-bt-top" ref={btTopRef} />
          <div className="bpm-transition-bt-line bpm-transition-bt-right" ref={btRightRef} />
          <div className="bpm-transition-bt-line bpm-transition-bt-bottom" ref={btBottomRef} />
          <div className="bpm-transition-bt-line bpm-transition-bt-left" ref={btLeftRef} />
        </div>
      )}

      {variant === "grid" && isTransitioning && (
        <div
          ref={overlayRef}
          className="bpm-transition-overlay"
          aria-hidden
        >
          <div ref={gridMaskRef} className="bpm-transition-grid-mask" />
        </div>
      )}
    </div>
  );
}
