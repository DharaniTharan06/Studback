"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser, authKey } from "./queries";
import { profileSchema } from "./schemas";
import { patch } from "@/lib/api/client";
import { channelKeys } from "@/features/channels/queries";

import { Avatar } from "@/components/shared/avatar";

import { Button } from "@/components/ui/button";

function ProfileForm() {
  const { data: user } = useUser();
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullname: user?.fullname ?? "", email: user?.email ?? "" },
  });
  return (
    <form
      className="max-w-xl space-y-5"
      onSubmit={handleSubmit(async (values) => {
        try {
          await patch("/users/update/details", values);
          await Promise.all([
            client.invalidateQueries({ queryKey: authKey }),
            client.invalidateQueries({ queryKey: channelKeys.all }),
          ]);
          toast.success("Profile updated");
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error ? error.message : "Couldn’t save profile",
          });
        }
      })}
    >
      <div className="mb-8 flex items-center gap-4">
        <Avatar
          src={user?.avatar}
          name={user?.username}
          className="size-16 text-xl"
        />
        <div>
          <p className="text-base font-semibold">
            {user?.fullname ?? user?.username}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            @{user?.username}
          </p>
        </div>
      </div>
      {(["fullname", "email"] as const).map((name) => (
        <label className="field" key={name}>
          <span>{name === "fullname" ? "Full name" : "Email address"}</span>
          <input
            className="input"
            type={name === "email" ? "email" : "text"}
            autoComplete={name === "email" ? "email" : "name"}
            {...register(name)}
          />
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
        {isSubmitting ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
