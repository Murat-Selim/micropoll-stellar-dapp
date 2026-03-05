'use client';

import { useWallet } from '@/hooks/useWallet';
import { NetworkType, WalletType } from 'stellar-wallet-kit';

export default function WalletBar() {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    network,
    balance,
    isLoadingBalance,
    connect,
    disconnect,
    availableWallets,
  } = useWallet();

  // Kullanıcı adresini kısalt (G...XYZ)
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
  };

  // Freighter yüklü mü kontrolü
  const freighter = availableWallets.find(w => w.id === WalletType.FREIGHTER);
  const isFreighterInstalled = freighter?.installed;

  // Ağ kontrolü - Testnet değilse uyarı göster
  const isWrongNetwork = network !== NetworkType.TESTNET;

  const handleConnect = async () => {
    console.log('[MicroPoll] action:', { type: 'connect_wallet' });
    try {
      await connect(WalletType.FREIGHTER);
    } catch (err) {
      console.error('[MicroPoll] Connect error:', err);
    }
  };

  const handleDisconnect = async () => {
    console.log('[MicroPoll] action:', { type: 'disconnect_wallet' });
    await disconnect();
  };

  return (
    <header className="bg-white border-b-4 border-black sticky top-0 z-50">
      {/* Ağ uyarısı - Testnet değilse göster */}
      {isConnected && isWrongNetwork && (
        <div className="bg-red-600 text-white text-center py-2 font-bold text-sm">
          ⚠️ Wrong Network! Please switch to Testnet in your wallet.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Sol: Logo */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider uppercase font-mono">
          🗳️ MICROPOLL
        </h1>

        {/* Sağ: Cüzdan butonu ve bakiye */}
        <div className="flex items-center gap-4">
          {isConnected && account ? (
            <>
              {/* Adres ve bakiye */}
              <div className="hidden md:block font-mono text-sm">
                <span className="font-bold">{shortenAddress(account.publicKey)}</span>
                <span className="ml-2">
                  {isLoadingBalance ? '...' : balance ? `${parseFloat(balance).toFixed(2)} XLM` : '0.00 XLM'}
                </span>
              </div>

              {/* Mobil için sadece bakiye */}
              <div className="md:hidden font-mono text-sm">
                <span className="font-bold">
                  {isLoadingBalance ? '...' : balance ? `${parseFloat(balance).toFixed(2)}` : '0.00'} XLM
                </span>
              </div>

              <button
                onClick={handleDisconnect}
                data-testid="disconnect-wallet"
                className="brutalist-btn text-sm"
              >
                DISCONNECT
              </button>
            </>
          ) : (
            <>
              {/* Freighter yüklü değse */}
              {!isFreighterInstalled && isFreighterInstalled !== undefined ? (
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutalist-btn text-sm"
                >
                  INSTALL FREIGHTER
                </a>
              ) : (
                <button
                  onClick={handleConnect}
                  data-testid="connect-wallet"
                  disabled={isConnecting}
                  className="brutalist-btn text-sm"
                >
                  {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className="bg-red-100 border-t-2 border-red-600 px-4 py-2 text-sm text-red-800">
          Error: {error.message}
        </div>
      )}
    </header>
  );
}
