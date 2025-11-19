import { create } from 'zustand';
type Mode = 'LITE' | 'PRO';

type State = {
  token: string;
  timeframe: string;
  mode: Mode;
  setToken: (t: string) => void;
  setTimeframe: (tf: string) => void;
  toggleMode: () => void;
};

export const useSession = create<State>((set, get) => ({
  token: 'ETH',
  timeframe: '30m',
  mode: 'LITE',
  setToken: (t) => set({ token: t }),
  setTimeframe: (tf) => set({ timeframe: tf }),
  toggleMode: () => set({ mode: get().mode === 'LITE' ? 'PRO' : 'LITE' }),
}));
