import '@/styles/globals.css';

export const metadata = {
    title: 'Kết quả thanh toán VNPay',
    description: 'Kết quả thanh toán VNPay - Trang hiển thị kết quả giao dịch'
};

export default function VNPayReturnLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="vi">
            <head>
                <title>Kết quả thanh toán VNPay</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="robots" content="noindex, nofollow" />
                <meta
                    name="description"
                    content="Kết quả thanh toán VNPay - Trang hiển thị kết quả giao dịch"
                />
            </head>
            <body className="antialiased bg-gray-50">{children}</body>
        </html>
    );
}
