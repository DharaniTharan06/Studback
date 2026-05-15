"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { patch } from "@/lib/api/client";
import type { Video } from "@/features/videos/types";
import { videoKeys } from "@/features/videos/queries";
import { studioKeys } from "./queries";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FileField } from "@/components/shared/file-field";
export const videoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give your video a title")
    .max(200, "Keep your title under 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Tell viewers a little about your video")
    .max(10000, "Keep the description under 10,000 characters"),
});
export function EditVideoDialog({
  video,
  open,
  onOpenChange,
}: {
  video: Video;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof videoSchema>>({
    resolver: zodResolver(videoSchema),
    defaultValues: { title: video.title, description: video.description ?? "" },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Refine your story"
      description="Update your title, description, or thumbnail."
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (data) => {
          const form = new FormData();
          form.append("title", data.title);
          form.append("description", data.description);
          if (thumbnail) form.append("thumbnail", thumbnail);
          try {
            await patch(`/videos/${video._id}`, form);
            await Promise.all([
              client.invalidateQueries({ queryKey: studioKeys.videos }),
              client.invalidateQueries({ queryKey: videoKeys.all }),
            ]);
            onOpenChange(false);
            toast.success("Video updated");
          } catch (error) {
            setError("root", {
              message:
                error instanceof Error
                  ? error.message
                  : "Couldn’t save changes",
            });
          }
        })}
      >
        {(["title", "description"] as const).map((name) => (
          <label className="field" key={name}>
            <span>{name === "title" ? "Title" : "Description"}</span>
            {name === "title" ? (
              <input className="input" {...register(name)} />
            ) : (
              <textarea className="input min-h-32" {...register(name)} />
            )}
            {errors[name] && (
              <small className="field-error">{errors[name]?.message}</small>
            )}
          </label>
        ))}
        <FileField
          label="Replace thumbnail (optional)"
          accept="image/*"
          file={thumbnail}
          onChange={setThumbnail}
          disabled={isSubmitting}
        />
        {errors.root && (
          <p role="alert" className="field-error">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </Dialog>
  );
}
