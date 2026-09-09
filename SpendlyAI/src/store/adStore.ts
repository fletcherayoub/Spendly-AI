import { create } from 'zustand';

interface AdState {
  isPremium: boolean;
  scanCount: number;
  incrementScanCount: () => void;
  setPremium: (status: boolean) => void;
}

export const useAdStore = create<AdState>((set) => ({
  isPremium: false,
  scanCount: 0,
  incrementScanCount: () => set((state) => ({ scanCount: state.scanCount + 1 })),
  setPremium: (status) => set({ isPremium: status }),
}));
