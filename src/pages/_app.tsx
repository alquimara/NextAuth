import { AuthProvider } from '@/context/signContext'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useContext } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )

}
