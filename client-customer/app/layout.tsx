import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StoreProvider from '@/lib/store/StoreProvider'
import Header from '@/components/layout/Header'
import { Toaster } from '@/components/ui/sonner'

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen flex flex-col`}>
        <StoreProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  )
}
