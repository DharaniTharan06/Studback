"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RectangleHorizontal,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { usePlayer } from "@/stores/player";
import { duration, safeMediaUrl } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
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
      {source && !error && (
        <div className="player-controls absolute right-0 bottom-0 left-0 px-3 pt-10 pb-2 sm:px-4">
          <input
            aria-label="Seek video"
            type="range"
            min={0}
            max={total || 1}
            step={0.1}
            value={time}
            onChange={(event) => seek(Number(event.target.value))}
            className="mb-1 h-4 w-full accent-primary"
          />
          <div className="flex items-center gap-1">
            <button
              aria-label={playing ? "Pause (K)" : "Play (K)"}
              className={controls}
              onClick={() => void togglePlay()}
            >
              {playing ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </button>
            <button
              aria-label={muted ? "Unmute (M)" : "Mute (M)"}
              className={controls}
              onClick={toggleMute}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-5" />
              ) : (
                <Volume2 className="size-5" />
              )}
            </button>
            <input
              aria-label="Volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="hidden w-20 accent-primary sm:block"
            />
            <span className="ml-2 text-[11px] tabular-nums">
              {duration(time)} / {duration(total)}
            </span>
            <div className="flex-1" />
            <select
              aria-label="Playback speed"
              value={rate}
              onChange={(event) => {
                const speed = Number(event.target.value);
                setRate(speed);
                if (videoRef.current) videoRef.current.playbackRate = speed;
              }}
              className="h-8 rounded bg-[var(--player-overlay)] px-1 text-xs text-[var(--player-foreground)]"
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
            <Tooltip label="Theater mode">
              <button
                className={`${controls} hidden sm:inline-flex`}
                aria-label="Toggle theater mode"
                aria-pressed={theater}
                onClick={toggleTheater}
              >
                <RectangleHorizontal className="size-5" />
              </button>
            </Tooltip>
            <button
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen (F)"}
              className={controls}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
