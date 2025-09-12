// pages/_app.js
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiAdapter, ensureAppKit } from '../lib/appkit'

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())
  const [wagmi, setWagmi] = useState(null)

  // Init AppKit only on client; render after wagmi is ready
  useEffect(() => {
    try {
      const adapter = ensureAppKit()
      setWagmi(adapter)
      if (!adapter) {
        // rare: retry once if first call ran before window initialized
        const t = setTimeout(() => setWagmi(ensureAppKit()), 150)
        return () => clearTimeout(t)
      }
    } catch (e) {
      console.error('AppKit init error:', e)
    }
  }, [])

  if (!wagmi?.wagmiConfig) {
    // Avoid rendering wagmi hooks until config is ready
    return (
      <>
        <Head><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />
      </>
    )
  }

  return (
    <>
      <Head><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmi.wagmiConfig}>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </>
  )
}
