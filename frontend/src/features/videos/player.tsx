"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Play,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { usePlayer } from "@/stores/player";
import { duration, safeMediaUrl } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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
      {!source || error ? (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--player-background)] px-6 text-center"
        >
          <Play className="size-9 opacity-50" />
          <p className="text-sm font-medium">This video couldn’t be played.</p>
          <p className="text-xs opacity-70">
            The media may be unavailable. Please try again.
          </p>
          {source && (
            <Button
              variant="secondary"
              onClick={() => {
                setError(false);
                videoRef.current?.load();
              }}
            >
              <RotateCcw />
              Retry playback
            </Button>
          )}
        </div>
      ) : (
        !playing && (
          <button
            aria-label="Play video"
            className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            onClick={() => void togglePlay()}
          >
            <Play className="ml-1 size-7 fill-current" />
          </button>
        )
      )}
      {buffering && !error && (
        <LoaderCircle
          aria-label="Buffering video"
          className="pointer-events-none absolute top-1/2 left-1/2 size-9 -translate-x-1/2 -translate-y-1/2 animate-spin"
        />
      )}
    </div>
  );
}
