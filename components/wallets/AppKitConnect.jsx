// components/wallets/AppKitConnect.jsx
'use client';

import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'

export default function AppKitConnect({ className }) {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const short = a => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '')

  if (isConnected) {
    return (
      <div className={className} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="addr">{short(address)}</span>
        <button className="btn" onClick={() => disconnect()}>Disconnect</button>
      </div>
    )
  }

  return (
    <button className="wallet-cta" onClick={() => open()}>
      Connect Wallet
    </button>
  )
}
