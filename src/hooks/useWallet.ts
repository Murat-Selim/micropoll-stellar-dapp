'use client';

import { useWallet as useStellarWallet, NetworkType } from 'stellar-wallet-kit';
import { useState, useEffect, useCallback } from 'react';

const HORIZON_TESTNET_URL = 'https://horizon-testnet.stellar.org';

export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  network: NetworkType;
  error: string | null;
}

export function useWallet() {
  const wallet = useStellarWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // XLM bakiyesini Horizon'dan çek
  const fetchBalance = useCallback(async (publicKey: string) => {
    if (!publicKey) return;
    
    setIsLoadingBalance(true);
    try {
      const response = await fetch(`${HORIZON_TESTNET_URL}/accounts/${publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch account');
      
      const data = await response.json();
      const xlmBalance = data.balances.find(
        (b: { asset_type: string }) => b.asset_type === 'native'
      );
      setBalance(xlmBalance ? xlmBalance.balance : '0');
    } catch (err) {
      console.error('[MicroPoll] Balance fetch error:', err);
      setBalance(null);
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  // Bağlantı成功后 bakiyeyi çek
  useEffect(() => {
    if (wallet.account?.publicKey) {
      fetchBalance(wallet.account.publicKey);
    } else {
      setBalance(null);
    }
  }, [wallet.account?.publicKey, fetchBalance]);

  return {
    ...wallet,
    balance,
    isLoadingBalance,
    fetchBalance,
  };
}
