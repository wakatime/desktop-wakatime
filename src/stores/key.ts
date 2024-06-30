import { create } from "zustand";

type KeyState = {
  key?: string;
  setKey: (key: string) => void;
};

export const useWakatimeKey = create<KeyState>((set) => ({
  key: undefined,
  setKey: (key: string) => {
    localStorage.setItem("WAKATIME_KEY", key);
    set({ key });
  },
}));
