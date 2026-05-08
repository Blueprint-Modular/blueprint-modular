"use client";

import React from "react";

/**
 * @component bpm.video
 * @description Lecteur vidéo HTML5 avec contrôles natifs et options de lecture en boucle/silencieux.
 * @example
 * bpm.video({ src: "/videos/demo.mp4", controls: true, width: 640, height: 360 })
 *
 * @param {object} props
 * @param {string} props.src - URL de la vidéo. Obligatoire.
 * @param {boolean} [props.controls=true] - Affiche les contrôles natifs. Optionnel.
 * @param {boolean} [props.loop=false] - Lecture en boucle. Optionnel.
 * @param {boolean} [props.muted=false] - Lecture silencieuse. Optionnel.
 * @param {number} [props.width] - Largeur en pixels. Optionnel.
 * @param {number} [props.height] - Hauteur en pixels. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.image, bpm.carousel, bpm.lightbox
 */
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
