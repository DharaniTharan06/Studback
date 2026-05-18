"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Upload, Film, Check } from "lucide-react";
import { toast } from "sonner";
import { api, type Envelope } from "@/lib/api/client";
import { useObjectUrl } from "@/hooks/use-object-url";
import { videoSchema } from "./video-form";
import { studioKeys } from "./queries";
import { videoKeys } from "@/features/videos/queries";
import type { Video } from "@/features/videos/types";
import { Button } from "@/components/ui/button";
import { FileField } from "@/components/shared/file-field";
import { PageHeading } from "@/components/shared/states";
export function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(0);
  const preview = useObjectUrl(file);
  const poster = useObjectUrl(thumbnail);
  const controller = useRef<AbortController | null>(null);
  const client = useQueryClient();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
  });
  useEffect(() => () => controller.current?.abort(), []);
  return (
    <>
      <PageHeading
        eyebrow="Creator Studio / Upload"
        title="Bring your story to life."
        description="A thoughtful title. A great thumbnail. A perspective only you can share."
      />
      <div className="mb-8 flex items-center gap-4 text-xs">
        <span
          className={`flex items-center gap-2 ${step === 1 ? "text-primary" : "text-muted-foreground"}`}
        >
          <span className="flex size-6 items-center justify-center rounded-full border">
            {step === 2 ? <Check className="size-3" /> : "1"}
          </span>
          Select video
        </span>
        <span className="h-px w-12 bg-border" />
        <span
          className={`flex items-center gap-2 ${step === 2 ? "text-primary" : "text-muted-foreground"}`}
        >
          <span className="flex size-6 items-center justify-center rounded-full border">
            2
          </span>
          Details & publish
        </span>
      </div>
      {step === 1 ? (
        <div className="max-w-2xl rounded-xl border bg-surface p-6 md:p-10">
          <Film className="mb-5 size-8 text-primary" />
          <h2 className="mb-2 text-xl font-semibold tracking-tight">
            Start with your video.
          </h2>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            Choose the story you want to share. You’ll add a title and thumbnail
            next.
          </p>
          <FileField
            label="Video file"
            accept="video/*"
            file={file}
            onChange={setFile}
          />
          <Button className="mt-6" disabled={!file} onClick={() => setStep(2)}>
            Continue
            <ArrowRight />
          </Button>
        </div>
      ) : (
        <form
          className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]"
          onSubmit={(event) => {
            void handleSubmit(async (values) => {
              if (!file || !thumbnail) {
                setError("root", {
                  message: "Add both a video and a thumbnail before publishing",
                });
                return;
              }
              const form = new FormData();
              form.append("videoFile", file);
              form.append("thumbnailFile", thumbnail);
              form.append("title", values.title);
              form.append("description", values.description);
              controller.current = new AbortController();
              setProgress(0);
              setSent(0);
              try {
                await api.post<Envelope<{ video: Video }>>("/videos", form, {
                  signal: controller.current.signal,
                  timeout: 600000,
                  onUploadProgress: (event) => {
                    setSent(event.loaded);
                    setProgress(
                      event.total
                        ? Math.round((event.loaded / event.total) * 100)
                        : 0
                    );
                  },
                });
                await Promise.all([
                  client.invalidateQueries({ queryKey: videoKeys.all }),
                  client.invalidateQueries({ queryKey: studioKeys.all }),
                ]);
                toast.success("Your video is published");
                router.push("/studio/content");
              } catch (error) {
                setError("root", {
                  message:
                    error instanceof Error
                      ? error.message
                      : "Couldn’t upload your video",
                });
              }
            })(event);
          }}
        >
          <div className="space-y-6">
            <label className="field">
              <span>Title</span>
              <input
                className="input"
                placeholder="Give your story a good introduction"
                disabled={isSubmitting}
                {...register("title")}
              />
              {errors.title && (
                <small className="field-error">{errors.title.message}</small>
              )}
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                className="input min-h-48"
                placeholder="What should your viewers know?"
                disabled={isSubmitting}
                {...register("description")}
              />
              {errors.description && (
                <small className="field-error">
                  {errors.description.message}
                </small>
              )}
            </label>
            <FileField
              label="Thumbnail"
              accept="image/*"
              file={thumbnail}
              onChange={setThumbnail}
              required
              disabled={isSubmitting}
            />
            {isSubmitting && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-lg border bg-surface p-4"
              >
                <p className="text-sm font-medium">
                  {progress >= 100
                    ? "Processing your video…"
                    : `Uploading · ${progress}%`}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {progress >= 100
                    ? "Your file has been sent. Studback is preparing it for playback."
                    : `${(sent / 1024 / 1024).toFixed(1)} MB sent`}
                </p>
                <progress
                  value={progress}
                  max={100}
                  aria-label="File transfer progress"
                  className="mt-3 h-2 w-full accent-primary"
                />
              </div>
            )}
            {errors.root && (
              <p role="alert" className="field-error">
                {errors.root.message}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setStep(1)}
              >
                <ArrowLeft />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Publishing…" : "Publish video"}
                <Upload />
              </Button>
            </div>
          </div>
          <aside className="overflow-hidden rounded-xl border bg-surface">
            {preview && (
              <video
                controls
                playsInline
                src={preview}
                poster={poster}
                className="aspect-video w-full bg-[var(--player-background)]"
                aria-label="Your video preview"
              />
            )}
            <div className="p-5">
              <p className="eyebrow mb-2">Your video</p>
              <p className="break-words text-sm font-medium">{file?.name}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ""} ·
                Public after publishing
              </p>
              <p className="mt-4 border-t pt-4 text-xs leading-6 text-muted-foreground">
                A clear thumbnail helps the right people find your video. You
                can change visibility anytime in your content manager.
              </p>
            </div>
          </aside>
        </form>
      )}
    </>
  );
}
