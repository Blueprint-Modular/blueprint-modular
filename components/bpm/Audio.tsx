"use client";

import React from "react";

export interface AudioProps {
  src: string;
  controls?: boolean;
  loop?: boolean;
  className?: string;
}

/**
 * @component bpm.audio
 * @description Lecteur audio HTML5 avec contrôles natifs pour fichiers audio.
 * @example
 * bpm.audio({ src: "/audio/notification.mp3", controls: true })
 *
 * @param {object} props
 * @param {string} props.src - URL du fichier audio. Obligatoire.
 * @param {boolean} [props.controls=true] - Affiche les contrôles de lecture. Optionnel.
 * @param {boolean} [props.loop=false] - Active la lecture en boucle. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.video, bpm.filePreview
 */
export function Audio(p: AudioProps) {
  const { src, controls = true, loop = false, className = "" } = p;
  return <audio src={src} controls={controls} loop={loop} className={"bpm-audio w-full max-w-full " + className} />;
}
