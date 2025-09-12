// pages/_app.js
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiAdapter, ensureAppKit } from '../lib/appkit'

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())
  const [wagmi, setWagmi] = useState(null)

  // Initialise AppKit + récupère l'adapter UNIQUEMENT côté client
  useEffect(() => {
    try {
      ensureAppKit()                    // idempotent + safe SSR
      const adapter = getWagmiAdapter() // singleton créé par ensureAppKit
      setWagmi(adapter)
    } catch (e) {
      console.error('AppKit init error:', e)
    }
  }, [])

  // Pendant l'init, on évite de rendre des hooks wagmi
  if (!wagmi?.wagmiConfig) {
    return (
      <>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />
      </>
    )
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmi.wagmiConfig}>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </>
  )
}
