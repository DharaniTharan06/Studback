"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { loginSchema, registerSchema } from "./schemas";
import { authKey } from "./queries";
import type { User } from "./types";
import { post } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { FileField } from "@/components/shared/file-field";
export function LoginForm() {
  const router = useRouter();
  const client = useQueryClient();
  const [visible, setVisible] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        try {
          const result = await post<{ user: User }>("/users/login", {
            [values.identity.includes("@") ? "email" : "username"]:
              values.identity,
            password: values.password,
          });
          client.clear();
          client.setQueryData(authKey, result.user);
          router.replace("/");
          toast.success("Welcome back");
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error ? error.message : "Couldn’t sign in",
          });
        }
      })}
    >
      <label className="field">
        <span>Email or username</span>
        <input
          className="input"
          autoComplete="username"
          {...register("identity")}
          aria-invalid={!!errors.identity}
        />
        {errors.identity && (
          <small className="field-error">{errors.identity.message}</small>
        )}
      </label>
      <label className="field">
        <span>Password</span>
        <span className="relative">
          <input
            className="input pr-12"
            autoComplete="current-password"
            type={visible ? "text" : "password"}
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute top-3 right-3 text-muted-foreground"
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </span>
        {errors.password && (
          <small className="field-error">{errors.password.message}</small>
        )}
      </label>
      {errors.root && (
        <p role="alert" className="field-error">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing you in…" : "Sign in"}
        <ArrowRight />
      </Button>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        New around here?{" "}
        <Link href="/register" className="font-medium text-primary">
          Create an account
        </Link>
      </p>
    </form>
  );
}
export function RegisterForm() {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });
  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        if (!avatar) {
          setError("root", {
            message: "Choose an avatar to make your profile your own",
          });
          return;
        }
        const form = new FormData();
        Object.entries(values).forEach(([key, value]) =>
          form.append(key, value)
        );
        form.append("avatar", avatar);
        if (cover) form.append("coverImage", cover);
        try {
          await post("/users/register", form);
          toast.success("Your account is ready. Sign in to get started.");
          router.push("/login");
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Couldn’t create your account",
          });
        }
      })}
    >
      {(["fullname", "username", "email", "password"] as const).map((name) => (
        <label key={name} className="field">
          <span>
            {
              {
                fullname: "Full name",
                username: "Username",
                email: "Email address",
                password: "Password",
              }[name]
            }
          </span>
          <input
            className="input"
            type={
              name === "password"
                ? "password"
                : name === "email"
                  ? "email"
                  : "text"
            }
            autoComplete={
              {
                fullname: "name",
                username: "username",
                email: "email",
                password: "new-password",
              }[name]
            }
            {...register(name)}
            aria-invalid={!!errors[name]}
          />
          {errors[name] && (
            <small className="field-error">{errors[name]?.message}</small>
          )}
        </label>
      ))}
      <FileField
        label="Your avatar"
        accept="image/*"
        file={avatar}
        onChange={setAvatar}
        required
        disabled={isSubmitting}
      />
      <details>
        <summary className="cursor-pointer text-xs text-muted-foreground">
          Add a cover image (optional)
        </summary>
        <div className="mt-3">
          <FileField
            label="Cover image"
            accept="image/*"
            file={cover}
            onChange={setCover}
            disabled={isSubmitting}
          />
        </div>
      </details>
      {errors.root && (
        <p role="alert" className="field-error">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating your account…" : "Create account"}
        <ArrowRight />
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
