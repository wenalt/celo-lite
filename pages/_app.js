// pages/_app.js
import { useState } from 'react'
import Head from 'next/head'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getWagmiAdapter, ensureAppKit } from '../lib/appkit'

// Initialize AppKit on the client, once, before React renders
if (typeof window !== 'undefined') {
  ensureAppKit()
}
const wagmi = getWagmiAdapter()

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())

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
