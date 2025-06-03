import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StoreProvider from '@/lib/store/StoreProvider';
import Header from '@/components/common/Header';
import { Toaster } from '@/components/ui/toaster';
import { Init } from '@/components/common/Init';
import AIChatBot from '@/components/AIChatBot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Aliconcon - Your Shopping Destination',
    description: 'Discover the latest trends and shop with Aliconcon.'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <StoreProvider>
                    <Toaster />
                    <Header />
                    <Init />

                    {children}

                    {/* AI ChatBot - Global floating chat bubble */}
                    <AIChatBot />
                </StoreProvider>
            </body>
        </html>
    );
}
