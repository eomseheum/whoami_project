import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(160).default("")
});

export const linkSchema = z.object({
  title: z.string().min(1).max(50),
  url: z.string().url().refine((value) => value.startsWith("https://"), "HTTPS URL만 허용됩니다."),
  platform: z.enum(["youtube", "instagram", "tiktok", "website", "other"])
});
