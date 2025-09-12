// lib/appkit.js
import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { celo } from 'viem/chains'
import { http } from 'wagmi'

// Singleton internes
let _appkit = null
let _wagmi = null

// Ton WC project id (Vercel > Environment Variables)
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID

// Réseaux au format attendu par AppKit (CAIP + endpoints)
const networks = [
  {
    id: `eip155:${celo.id}`,              // CAIP-2
    chainId: celo.id,                     // 42220
    name: celo.name,                      // "Celo"
    nativeCurrency: celo.nativeCurrency,  // { name, symbol, decimals }
    rpcUrls: { default: { http: ['https://forno.celo.org'] } },
    blockExplorers: {
      default: { name: 'CeloScan', url: 'https://celoscan.io' }
    }
  }
]

/**
 * Initialise AppKit une seule fois côté client.
 * Renvoie l'instance AppKit (ou null côté SSR).
 */
export function ensureAppKit () {
  if (typeof window === 'undefined') return null
  if (_appkit) return _appkit

  // 1) Adapter Wagmi correctement configuré (networks + transports)
  _wagmi = new WagmiAdapter({
    networks,
    transports: {
      [celo.id]: http('https://forno.celo.org')
    },
    ssr: true
  })

  // 2) AppKit (modal + gestion wallets)
  _appkit = createAppKit({
    adapters: [_wagmi],
    networks,
    projectId,
    defaultNetwork: networks[0],
    enableEIP6963: true,    // détecte Rabby & co
    enableInjected: true,   // Metamask / Brave
    enableCoinbase: true,
    themeMode: 'light',
    metadata: {
      name: 'Celo Lite',
      description: 'Ecosystem · Staking · Governance',
      url: 'https://celo-lite.vercel.app',
      icons: ['https://celo-lite.vercel.app/icon.png']
    },
    features: { analytics: false }
  })

  return _appkit
}

/** Récupère l’adapter Wagmi (après ensureAppKit). */
export function getWagmiAdapter () {
  return _wagmi || { wagmiConfig: undefined }
}
