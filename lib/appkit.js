// lib/appkit.js
// Initialisation AppKit côté client, une seule fois, avec Celo mainnet
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createConfig, http } from 'wagmi'
import { celo } from 'viem/chains'

let _created = false
let _wagmiAdapter = null

export function ensureAppKit() {
  if (typeof window === 'undefined' || _created) return

  const projectId =
    process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
    '138901e6be32b5e78b59aa262e517fd0'

  // viem/chains -> possède déjà rpcUrls.{default, public}.http
  const networks = [celo]

  // Transports explicites pour éviter l’erreur .http undefined
  const transports = {
    [celo.id]: http('https://forno.celo.org')
  }

  // Wagmi v2 config (SSR true = safe Next.js)
  const wagmiConfig = createConfig({
    chains: networks,
    transports,
    ssr: true
  })

  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks,       // <= important: objets viem (avec rpcUrls.http)
    wagmiConfig,
    ssr: true
  })

  // Création du modal AppKit
  createAppKit({
    projectId,
    adapters: [wagmiAdapter],
    defaultNetwork: celo,
    // Affiche les wallets injectés (Rabby) + EIP-6963 registry
    features: {
      allWallets: true,
      eip6963: true,
      socials: false,
      email: false,
      analytics: false
    },
    themeMode: 'light', // tu peux repasser en "auto" si besoin
    metadata: {
      name: 'Celo Lite',
      description: 'Mini-hub for the Celo Prosperity ecosystem',
      url: window.location.origin,
      icons: [window.location.origin + '/icon.png']
    }
  })

  _wagmiAdapter = wagmiAdapter
  _created = true
}

export function getWagmiAdapter() {
  return _wagmiAdapter
}
