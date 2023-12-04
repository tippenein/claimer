import { StacksSessionState, authenticate } from 'micro-stacks/connect';
import create from 'zustand';

import { useClaim } from './useClaim';

interface AuthStore {
  session: StacksSessionState | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const appDetails = {
  name: 'Claimer',
  icon: '../favicon.svg'
};

const SESSION_STORAGE_KEY = 'stacks-session';
let rawSession = localStorage.getItem(SESSION_STORAGE_KEY);
let session: AuthStore['session'] = null;
if (rawSession) {
  try {
    session = JSON.parse(rawSession);
  } catch (err) {
    rawSession = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

export const useAuth = create<AuthStore>((set) => ({
  session,

  disconnect: () => {
    set({ session: null });
    useClaim.getState().resetAll();
    localStorage.clear();
  },

  connect: async () => {
    try {
      const session = await authenticate({ appDetails });
      if (!session) throw new Error('invalid session');
      set({ session });
    } catch (err) {
      console.error(err);
    }
  }
}));
