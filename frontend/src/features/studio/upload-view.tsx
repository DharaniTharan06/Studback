"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Upload, Film } from "lucide-react";

import { videoSchema } from "./video-form";

import { Button } from "@/components/ui/button";
import { FileField } from "@/components/shared/file-field";
import { PageHeading } from "@/components/shared/states";
export function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [step, setStep] = useState(1);
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
  return (
    <>
      <PageHeading
        eyebrow="Creator Studio / Upload"
        title="Bring your story to life."
        description="A thoughtful title. A great thumbnail. A perspective only you can share."
      />
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
        </form>
      )}
    </>
  );
}
