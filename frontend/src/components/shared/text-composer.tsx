"use client";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const schema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Write something first")
    .max(5000, "Keep it under 5,000 characters"),
});
export function TextComposer({
  placeholder,
  label,
  initial = "",
  onSubmit,
}: {
  placeholder: string;
  label: string;
  initial?: string;
  onSubmit: (content: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { content: initial },
  });
  const content = useWatch({ control, name: "content" });
  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (values) => {
        try {
          await onSubmit(values.content);
          reset({ content: "" });
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Couldn’t save your message",
          });
        }
      })}
    >
      <textarea
        aria-label={label}
        placeholder={placeholder}
        className="input min-h-24 resize-y"
        disabled={isSubmitting}
        {...register("content")}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {content.length > 4500
            ? `${content.length} / 5000`
            : "Keep the conversation going."}
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Sending…" : label}
        </Button>
      </div>
      {(errors.content || errors.root) && (
        <p role="alert" className="field-error">
          {errors.content?.message ?? errors.root?.message}
        </p>
      )}
    </form>
  );
}
