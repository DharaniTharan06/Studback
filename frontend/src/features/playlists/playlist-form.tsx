"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { post, patch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { playlistKeys } from "./queries";
import type { Playlist } from "./types";
const schema = z.object({
  name: z.string().trim().min(1, "Give your playlist a name"),
  description: z.string().trim().min(1, "Add a short description"),
});
export function PlaylistForm({
  open,
  onOpenChange,
  playlist,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  playlist?: Playlist;
}) {
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: playlist?.name ?? "",
      description: playlist?.description ?? "",
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={playlist ? "Edit playlist" : "Make a collection"}
      description="Keep the videos you want to come back to, together."
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (data) => {
          try {
            if (playlist) await patch(`/playlist/${playlist._id}`, data);
            else await post("/playlist", data);
            await client.invalidateQueries({ queryKey: playlistKeys.all });
            toast.success(playlist ? "Playlist updated" : "Playlist created");
            reset();
            onOpenChange(false);
          } catch (error) {
            setError("root", {
              message:
                error instanceof Error
                  ? error.message
                  : "Couldn’t save playlist",
            });
          }
        })}
      >
        {(["name", "description"] as const).map((name) => (
          <label className="field" key={name}>
            <span>{name === "name" ? "Name" : "Description"}</span>
            {name === "name" ? (
              <input className="input" {...register(name)} />
            ) : (
              <textarea className="input min-h-24" {...register(name)} />
            )}
            {errors[name] && (
              <small className="field-error">{errors[name]?.message}</small>
            )}
          </label>
        ))}
        {errors.root && (
          <p role="alert" className="field-error">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : playlist
              ? "Save changes"
              : "Create playlist"}
        </Button>
      </form>
    </Dialog>
  );
}
