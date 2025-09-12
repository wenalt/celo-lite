// components/wallets/AppKitConnect.jsx
'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit /*, AppKitButton*/ } from '@reown/appkit/react';

export default function AppKitConnect({ className }) {
  // Récupère l’API AppKit, mais reste tolérant si elle n’est pas prête
  let appkit;
  try {
    appkit = useAppKit(); // { open, close, ... } quand prêt
  } catch {
    appkit = {};
  }
  const open = appkit?.open;

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');

  if (isConnected) {
    return (
      <div className={className} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="addr">{short(address)}</span>
        <button className="btn" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  // Fallback ultra-sûr : si open n’est pas encore dispo, on affiche quand même un vrai bouton
  // (dès que open arrive, le bouton déclenche le modal AppKit)
  const handleClick = () => {
    if (typeof open === 'function') open({ view: 'Connect' });
  };

  return (
    // tu gardes le look blanc “CTA”
    <button className="wallet-cta" onClick={handleClick}>
      Connect Wallet
    </button>
  );
}
