"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { loginSchema } from "./schemas";
import { authKey } from "./queries";
import type { User } from "./types";
import { post } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

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
    </form>
  );
}
