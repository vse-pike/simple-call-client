"use client";

import { useEffect, useRef } from "react";
import { CrownIcon } from "./icons/CrownIcon";
import { MicrophoneOffIcon } from "./icons/MicrophoneOffIcon";

export interface CardProps {
  name: string;
  audioMuted?: boolean;
  isHost?: boolean;
  videoMuted?: boolean;
  stream?: MediaStream | null;
  isSelf?: boolean;
  className?: string;
}

export function Card({
  name,
  audioMuted,
  videoMuted,
  isHost,
  stream,
  isSelf,
  className = "",
}: CardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream ?? null;
  }, [stream]);

  const showCaption = Boolean(stream) && !videoMuted;

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      <div
        className={[
          "relative flex aspect-video w-full items-center justify-center gap-2 px-5",
          "overflow-hidden rounded-[20px] border border-accent bg-white/5",
        ].join(" ")}
      >
        {stream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isSelf}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {!showCaption && (
          <>
            {isHost && (
              <CrownIcon
                aria-label="Хост встречи"
                className="absolute top-[14px] right-5 h-5 w-5 text-white opacity-[0.32]"
              />
            )}
            <span className="relative max-w-full truncate text-2xl leading-tight font-light text-white">
              {name}
            </span>
            {audioMuted && (
              <MicrophoneOffIcon
                aria-label="Микрофон выключен"
                className="relative h-7 w-7 text-accent"
              />
            )}
          </>
        )}
      </div>

      <div className="flex h-5 max-w-full items-center gap-1.5 px-1">
        {showCaption && (
          <>
            {audioMuted && (
              <MicrophoneOffIcon
                aria-label="Микрофон выключен"
                className="h-4 w-4 shrink-0 text-accent"
              />
            )}
            {isHost && (
              <CrownIcon
                aria-label="Хост встречи"
                className="h-4 w-4 shrink-0 text-white opacity-60"
              />
            )}
            <span className="truncate text-sm text-white">{name}</span>
          </>
        )}
      </div>
    </div>
  );
}
