"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

import { toast } from "sonner";
import { usePlayer } from "@/stores/player";
import { duration, safeMediaUrl } from "@/lib/utils";

export function Player({
  src,
  poster,
  title,
  videoRef,
}: {
  src?: string;
  poster?: string;
  title: string;
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(0);
  const [total, setTotal] = useState(0);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const { volume, muted, theater, setVolume, toggleMute, toggleTheater } =
    usePlayer();
  const source = safeMediaUrl(src);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
  }, [volume, muted, videoRef]);
  useEffect(() => {
    const listener = () =>
      setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", listener);
    return () => document.removeEventListener("fullscreenchange", listener);
  }, []);
  async function togglePlay() {
    const video = videoRef.current;
    if (!video || !source || error) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        toast.error("Playback couldn’t start. Try pressing play again.");
      }
    } else video.pause();
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await container.current?.requestFullscreen();
    } catch {
      toast.error("Fullscreen is unavailable in this browser");
    }
  }
  function seek(value: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(total, Math.max(0, value));
      setTime(videoRef.current.currentTime);
    }
  }
  const controls =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-md hover:bg-player-foreground/10 focus-visible:outline-player-foreground";
  return (
    <div
      ref={container}
      role="region"
      aria-label={`Video player: ${title}`}
      tabIndex={0}
      className="player relative aspect-video overflow-hidden rounded-xl"
      onKeyDown={(event) => {
        if (
          (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLSelectElement ||
            event.target instanceof HTMLButtonElement) &&
          event.key !== "Escape"
        )
          return;
        const key = event.key.toLowerCase();
        if (
          ![
            " ",
            "k",
            "m",
            "f",
            "j",
            "l",
            "arrowleft",
            "arrowright",
            "arrowup",
            "arrowdown",
          ].includes(key)
        )
          return;
        event.preventDefault();
        if (key === " " || key === "k") void togglePlay();
        else if (key === "m") toggleMute();
        else if (key === "f") void toggleFullscreen();
        else if (key === "j" || key === "arrowleft")
          seek(time - (key === "j" ? 10 : 5));
        else if (key === "l" || key === "arrowright")
          seek(time + (key === "l" ? 10 : 5));
        else
          setVolume(
            Math.min(1, Math.max(0, volume + (key === "arrowup" ? 0.1 : -0.1)))
          );
      }}
    >
      <video
        ref={videoRef}
        src={source}
        poster={safeMediaUrl(poster)}
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
        aria-label={title}
        onClick={() => void togglePlay()}
        onLoadedMetadata={(event) => {
          setTotal(
            Number.isFinite(event.currentTarget.duration)
              ? event.currentTarget.duration
              : 0
          );
          setBuffering(false);
        }}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onError={() => {
          setError(true);
          setBuffering(false);
        }}
      />
    </div>
  );
}
