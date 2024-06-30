import { z } from "zod";

export const appSettingsSchema = z.object({
  apiKey: z.string().nullish(),
  launchAtLogin: z.boolean().nullish(),
  enableLogging: z.boolean().nullish(),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;

export const initAppSettings: AppSettings = {
  apiKey: null,
  launchAtLogin: true,
  enableLogging: false,
};
