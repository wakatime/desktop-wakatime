import { z } from "zod";

export const appDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  icon: z.string().nullable(),
  version: z.string().nullable(),
  bundleId: z.string().nullable(),
  isBrowser: z.boolean(),
  isDefaultEnabled: z.boolean(),
  isElectronApp: z.boolean(),
});

export type AppData = z.infer<typeof appDataSchema>;
