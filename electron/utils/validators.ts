import { z } from "zod";

import { MonitoredApp } from "./types";

export const appDataSchema = z.object({
  id: z.custom<MonitoredApp>(),
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
