import { create } from 'zustand';
import type { Employee, UserRole } from '../types';

interface AuthState {
  employee: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  deviceApproved: boolean;
  setAuth: (employee: Employee | null) => void;
  setLoading: (loading: boolean) => void;
  setDeviceApproved: (approved: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  employee: null,
  isAuthenticated: false,
  isLoading: true,
  deviceApproved: true,
  setAuth: (employee) =>
    set({
      employee,
      isAuthenticated: !!employee,
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setDeviceApproved: (deviceApproved) => set({ deviceApproved }),
  logout: () =>
    set({
      employee: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
