"use client";

import React from "react";

export interface AudioProps {
  src: string;
  controls?: boolean;
  loop?: boolean;
  className?: string;
}

export function Audio(p: AudioProps) {
  const { src, controls = true, loop = false, className = "" } = p;
  return <audio src={src} controls={controls} loop={loop} className={"bpm-audio w-full max-w-full " + className} />;
}
