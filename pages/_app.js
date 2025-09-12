// pages/_app.js
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiAdapter, ensureAppKit } from '../lib/appkit'

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())
  const [wagmi, setWagmi] = useState(null)

  // Init AppKit UNIQUEMENT côté client, puis récupère l’adapter
  useEffect(() => {
    const adapter = ensureAppKit()
    setWagmi(adapter)

    // Sécurité: si jamais quelque chose retarde l’init, on retente 1x
    if (!adapter) {
      const t = setTimeout(() => {
        const again = ensureAppKit()
        setWagmi(again)
      }, 200)
      return () => clearTimeout(t)
    }
  }, [])

  // Tant que wagmiConfig pas prêt, on évite de rendre des hooks wagmi
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
