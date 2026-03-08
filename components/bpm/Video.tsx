"use client";

import React from "react";

export interface VideoProps {
  src: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export function Video(p: VideoProps) {
  const { src, controls = true, loop = false, muted = false, width, height, className = "" } = p;
  return (
    <video
      src={src}
      controls={controls}
      loop={loop}
      muted={muted}
      width={width}
      height={height}
      className={"bpm-video max-w-full " + className}
    />
  );
}
