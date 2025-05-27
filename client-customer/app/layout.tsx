import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreProvider from '@/lib/store/StoreProvider'
import Header from '@/components/common/Header'
import { Toaster } from '@/components/ui/toaster'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Aliconcon - Your Shopping Destination',
  description: 'Discover the latest trends and shop with Aliconcon.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <StoreProvider>
            <Toaster />
            <Header />
            {children}
          </StoreProvider>
      </body>
    </html>
  )
}
