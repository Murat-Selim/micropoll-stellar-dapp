'use client';

import { WalletProvider, useWallet, NetworkType, WalletType } from 'stellar-wallet-kit';
import { ReactNode } from 'react';

const walletConfig = {
  network: NetworkType.TESTNET,
  defaultWallet: WalletType.FREIGHTER,
  autoConnect: false,
  appName: 'MicroPoll',
};

function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <WalletProvider config={walletConfig}>
      {children}
    </WalletProvider>
  );
}

export { WalletProviderWrapper, useWallet, NetworkType, WalletType };
