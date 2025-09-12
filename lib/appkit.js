// lib/appkit.js
// Initialisation AppKit côté client (une seule fois) avec Celo mainnet.
// Corrige les erreurs "extendCaipNetworks … .http/.map" et évite les doubles inits.

import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createConfig, http } from 'wagmi'
import { celo } from 'viem/chains'

let _created = false
let _wagmiAdapter = null

export function ensureAppKit() {
  if (typeof window === 'undefined') return null
  if (_created && _wagmiAdapter) return _wagmiAdapter

  try {
    const projectId =
      process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
      '138901e6be32b5e78b59aa262e517fd0'

    // viem chain (possède rpcUrls.{default,public}.http)
    const networks = [celo]

    // wagmi v2 transports explicites (évite .http undefined)
    const transports = {
      [celo.id]: http('https://forno.celo.org')
    }

    // Wagmi config (SSR true = safe Next.js pages router)
    const wagmiConfig = createConfig({
      chains: networks,
      transports,
      ssr: true
    })

    const wagmiAdapter = new WagmiAdapter({
      projectId,
      networks,    // IMPORTANT: viem chains passées ici
      wagmiConfig,
      ssr: true
    })

    // Création AppKit (modal)
    createAppKit({
      projectId,
      adapters: [wagmiAdapter],
      defaultNetwork: celo,
      features: {
        allWallets: true,  // wallets injectés (Rabby) + catalogue
        eip6963: true,     // détection multi-wallets
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
    _created = true
    return _wagmiAdapter
  } catch (e) {
    console.error('AppKit init failed:', e)
    return null
  }
}

export function getWagmiAdapter() {
  return _wagmiAdapter
}
