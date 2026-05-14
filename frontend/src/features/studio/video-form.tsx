"use client";

import { z } from "zod";

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
