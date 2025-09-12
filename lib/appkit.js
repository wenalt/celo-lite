// lib/appkit.js
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit'           // core
import { celo } from 'wagmi/chains'

let adapter // single shared instance

export function getWagmiAdapter() {
  if (!adapter) {
    const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID
    adapter = new WagmiAdapter({
      projectId,
      networks: [celo],
      ssr: true,                 // important for Next.js
      transports: {
        [celo.id]: { http: 'https://forno.celo.org' },
      },
    })
  }
  return adapter
}

export function ensureAppKit() {
  if (typeof window === 'undefined') return
  if (window.__APPKIT_READY__) return

  const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID
  const wagmi = getWagmiAdapter()

  createAppKit({
    adapters: [wagmi],
    projectId,
    features: { analytics: false },      // keep it simple
    themeMode: 'system',
    themeVariables: {},                  // optional
  })

  window.__APPKIT_READY__ = true
}
