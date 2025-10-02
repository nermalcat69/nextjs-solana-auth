'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

// Define all popular wallets with their info
const ALL_WALLETS = [
  {
    name: 'Phantom',
    icon: 'https://phantom.app/img/phantom-logo.svg',
    url: 'https://phantom.app/',
    description: 'A friendly Solana wallet'
  },
  {
    name: 'Solflare',
    icon: 'https://solflare.com/assets/solflare-logo.svg',
    url: 'https://solflare.com/',
    description: 'Solflare is a non-custodial wallet'
  },
  {
    name: 'Backpack',
    icon: 'https://backpack.app/backpack.png',
    url: 'https://backpack.app/',
    description: 'A home for your xNFTs'
  },
  {
    name: 'Glow',
    icon: 'https://glow.app/logo.png',
    url: 'https://glow.app/',
    description: 'Glow Wallet'
  },
  {
    name: 'Trust Wallet',
    icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg',
    url: 'https://trustwallet.com/',
    description: 'The most trusted & secure crypto wallet'
  },
  {
    name: 'Coinbase Wallet',
    icon: 'https://wallet.coinbase.com/assets/images/favicon.ico',
    url: 'https://wallet.coinbase.com/',
    description: 'Coinbase Wallet'
  }
];

export default function WalletButtons() {
  const { publicKey, connected, disconnect, wallets, select, connecting } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issue by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleWalletSelect = (walletName: string) => {
    const installedWallet = wallets.find(w => w.adapter.name === walletName);
    if (installedWallet && installedWallet.readyState === 'Installed') {
      select(installedWallet.adapter.name);
    } else {
      // Wallet not installed, redirect to installation page
      const walletInfo = ALL_WALLETS.find(w => w.name === walletName);
      if (walletInfo) {
        window.open(walletInfo.url, '_blank');
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };



  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <div className="rounded-full border border-solid border-neutral-300 transition-colors flex items-center justify-center bg-neutral-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
          Loading wallets...
        </div>
      </div>
    );
  }

  if (!connected && !connecting) {
    return (
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <div className="grid grid-cols-3 gap-2 space-y-2">
          {wallets.map((wallet) => (
            <button
              key={wallet.adapter.name}
              onClick={() => handleWalletSelect(wallet.adapter.name)}
              className="rounded-full cursor-pointer border border-solid border-neutral-300 transition-colors flex items-center justify-center bg-white text-black font-medium text-sm sm:text-base h-10 sm:h-12 px-3 hover:bg-neutral-50 active:bg-neutral-100"
            >
              {wallet.adapter.icon && (
                <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-5 h-5 mr-2" />
              )}
              Connect {wallet.adapter.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="flex gap-4 justify-center items-center flex-col sm:flex-row">
        <div className="rounded-full border border-solid border-neutral-300 transition-colors flex items-center justify-center bg-neutral-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5">
          Connecting...
        </div>
      </div>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 font-mono text-sm break-all max-w-md">
          <div className="text-neutral-600 text-xs mb-1">Wallet Address:</div>
          <div className="text-neutral-900">{publicKey.toString()}</div>
        </div>
        <button
          onClick={handleDisconnect}
          className="rounded-full cursor-pointer border border-solid border-neutral-300 transition-colors flex items-center justify-center bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm h-10 px-4 "
        >
          Disconnect
        </button>
      </div>
    );
  }

  return null;
}