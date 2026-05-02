"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser, authKey } from "./queries";
import { profileSchema, passwordSchema } from "./schemas";
import { patch, post } from "@/lib/api/client";
import { channelKeys } from "@/features/channels/queries";
import { PageHeading } from "@/components/shared/states";
import { Avatar } from "@/components/shared/avatar";
import { FileField } from "@/components/shared/file-field";
import { Button } from "@/components/ui/button";
import { TabBar } from "@/components/ui/tab-bar";
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
function SecurityForm() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });
  return (
    <form
      className="max-w-xl space-y-5"
      onSubmit={handleSubmit(async (values) => {
        try {
          await post("/users/change-pwd", values);
          reset();
          toast.success("Password changed");
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Couldn’t change password",
          });
        }
      })}
    >
      <h2 className="text-lg font-semibold">A little peace of mind.</h2>
      <p className="text-sm leading-6 text-muted-foreground">
        Use a strong password that you don’t use anywhere else.
      </p>
      {(["oldPassword", "newPassword", "confirmpassword"] as const).map(
        (name) => (
          <label className="field" key={name}>
            <span>
              {
                {
                  oldPassword: "Current password",
                  newPassword: "New password",
                  confirmpassword: "Confirm new password",
                }[name]
              }
            </span>
            <input
              className="input"
              type="password"
              autoComplete={
                name === "oldPassword" ? "current-password" : "new-password"
              }
              {...register(name)}
            />
            {errors[name] && (
              <small className="field-error">{errors[name]?.message}</small>
            )}
          </label>
        )
      )}
      {errors.root && (
        <p role="alert" className="field-error">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
function BrandingForm() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const client = useQueryClient();
  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        try {
          if (avatar) {
            const form = new FormData();
            form.append("avatar", avatar);
            await patch("/users/update/avatar", form);
            setAvatar(null);
            toast.success("Avatar updated");
          }
          if (cover) {
            const form = new FormData();
            form.append("coverimage", cover);
            await patch("/users/update/cover-image", form);
            setCover(null);
            toast.success("Cover image updated");
          }
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Couldn’t update branding"
          );
        } finally {
          await Promise.all([
            client.invalidateQueries({ queryKey: authKey }),
            client.invalidateQueries({ queryKey: channelKeys.all }),
          ]);
          setPending(false);
        }
      }}
    >
      <h2 className="text-lg font-semibold">A look that’s all yours.</h2>
      <p className="text-sm text-muted-foreground">
        Let your channel look as distinctive as your perspective.
      </p>
      <FileField
        label="Avatar"
        accept="image/*"
        file={avatar}
        onChange={setAvatar}
        disabled={pending}
      />
      <FileField
        label="Channel cover image"
        accept="image/*"
        file={cover}
        onChange={setCover}
        disabled={pending}
      />
      <Button type="submit" disabled={pending || (!avatar && !cover)}>
        {pending ? "Uploading…" : "Update branding"}
      </Button>
    </form>
  );
}
export function SettingsView() {
  const [tab, setTab] = useState("Profile");
  return (
    <>
      <PageHeading
        eyebrow="Your account"
        title="Make yourself at home."
        description="A few details that make Studback feel like you."
      />
      <TabBar
        values={["Profile", "Branding", "Security"]}
        value={tab}
        onValueChange={setTab}
        label="Account settings"
        prefix="settings"
      />
      <section
        id="settings-panel"
        role="tabpanel"
        aria-labelledby={`settings-tab-${tab}`}
      >
        {tab === "Profile" ? (
          <ProfileForm />
        ) : tab === "Branding" ? (
          <BrandingForm />
        ) : (
          <SecurityForm />
        )}
      </section>
    </>
  );
}
