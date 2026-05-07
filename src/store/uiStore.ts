import { create } from 'zustand';

interface UIState {
  isClockingIn: boolean;
  isClockingOut: boolean;
  isStartingBreak: boolean;
  isEndingBreak: boolean;
  isSyncing: boolean;
  
  setClockingIn: (loading: boolean) => void;
  setClockingOut: (loading: boolean) => void;
  setStartingBreak: (loading: boolean) => void;
  setEndingBreak: (loading: boolean) => void;
  setSyncing: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isClockingIn: false,
  isClockingOut: false,
  isStartingBreak: false,
  isEndingBreak: false,
  isSyncing: false,

  setClockingIn: (isClockingIn) => set({ isClockingIn }),
  setClockingOut: (isClockingOut) => set({ isClockingOut }),
  setStartingBreak: (isStartingBreak) => set({ isStartingBreak }),
  setEndingBreak: (isEndingBreak) => set({ isEndingBreak }),
  setSyncing: (isSyncing) => set({ isSyncing }),
}));
