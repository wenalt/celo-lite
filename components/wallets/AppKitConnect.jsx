// components/wallets/AppKitConnect.jsx
'use client';
import { useAppKit } from '@reown/appkit/react';

export default function AppKitConnect({ className = 'wallet-cta', children }) {
  const { open } = useAppKit();
  return (
    <button className={className} onClick={() => open()}>
      {children || 'Connect Wallet'}
    </button>
  );
}
