import { create } from "zustand";
interface PlayerState {
  volume: number;
  muted: boolean;
  theater: boolean;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleTheater: () => void;
}
export const usePlayer = create<PlayerState>((set) => ({
  volume: 0.8,
  muted: false,
  theater: false,
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
  toggleTheater: () => set((state) => ({ theater: !state.theater })),
}));
