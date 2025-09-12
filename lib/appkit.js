// lib/appkit.js
// Single, client-only AppKit init using Wagmi + viem celo.
// This matches the “it worked” configuration and avoids the .http/.map crash.

import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createConfig, http } from 'wagmi'
import { celo } from 'viem/chains'

let _ready = false
let _wagmiAdapter = null

export function ensureAppKit() {
  if (typeof window === 'undefined') return null
  if (_ready && _wagmiAdapter) return _wagmiAdapter

  const projectId =
    process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
    '138901e6be32b5e78b59aa262e517fd0'

  // viem chain (has rpcUrls.default/public.http)
  const networks = [celo]

  // wagmi transports (explicit http avoids undefined .http access)
  const transports = {
    [celo.id]: http('https://forno.celo.org')
  }

  // wagmi v2 config (SSR true for Next pages router)
  const wagmiConfig = createConfig({
    chains: networks,
    transports,
    ssr: true
  })

  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,      // pass viem chains
    wagmiConfig,
    ssr: true
  })

  createAppKit({
    projectId,
    adapters: [wagmiAdapter],
    defaultNetwork: celo,
    features: {
      allWallets: true, // includes injected (Rabby) + WalletConnect catalog
      eip6963: true,
      socials: false,
      email: false,
      analytics: false
    },
    themeMode: 'light',
    metadata: {
      name: 'Celo Lite',
      description: 'Mini-hub for the Celo Prosperity ecosystem',
      url: window.location.origin,
      icons: [window.location.origin + '/icon.png']
    }
  })

  _wagmiAdapter = wagmiAdapter
  _ready = true
  return _wagmiAdapter
}

export function getWagmiAdapter() {
  return _wagmiAdapter
}
