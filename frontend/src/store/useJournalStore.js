import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useJournalStore = create(
  persist(
    (set) => ({
      vaultPassphrase: null,
      isVaultUnlocked: false,
      unlockVault: (passphrase) => set({ vaultPassphrase: passphrase, isVaultUnlocked: true }),
      lockVault: () => set({ vaultPassphrase: null, isVaultUnlocked: false }),
    }),
    {
      name: 'naqashly-vault-session',
      storage: createJSONStorage(() => sessionStorage), // Safe sessionStorage backing
    }
  )
);
