'use client';

import { useWallet as useStellarWallet } from 'stellar-wallet-kit';
import { createContext, useContext, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
}

const WalletStateContext = createContext<WalletContextType>({
  isConnected: false,
  address: null,
  balance: null,
});

export function useWalletState() {
  return useContext(WalletStateContext);
}

export function WalletStateProvider({ children }: { children: ReactNode }) {
  const { account, isConnected } = useStellarWallet();
  
  return (
    <WalletStateContext.Provider
      value={{
        isConnected,
        address: account?.publicKey ?? null,
        balance: null, // Balance handled in useWallet hook
      }}
    >
      {children}
    </WalletStateContext.Provider>
  );
}
