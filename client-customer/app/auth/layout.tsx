'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname.includes('/login');
    const activeTab = isLoginPage ? 'login' : 'register';

    useEffect(() => {
        let title = 'Aliconcon';
        if (pathname.includes('/login')) {
            title = 'Đăng nhập - Aliconcon';
        } else if (pathname.includes('/register')) {
            title = 'Đăng ký - Aliconcon';
        } else if (pathname.includes('/forgot-password')) {
            title = 'Quên mật khẩu - Aliconcon';
        } else if (pathname === '/auth') {
            title = 'Xác thực - Aliconcon';
        }
        document.title = title;
    }, [pathname]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
                    {/* Left side - Auth forms (passed as children) */}
                    <div className="p-8 rounded-2xl backdrop-blur-md bg-white/70 border border-blue-100 shadow-sm">
                        <Tabs value={activeTab} className="w-full mb-6">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login" asChild>
                                    <Link href="/auth/login">Đăng Nhập</Link>
                                </TabsTrigger>
                                <TabsTrigger value="register" asChild>
                                    <Link href="/auth/register">Đăng Ký</Link>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {children}
                    </div>

                    {/* Right side - Image and text */}
                    <div className="hidden md:block">
                        <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/login.jpg?height=1000&width=800"
                                alt="Xác thực"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 to-blue-400/40" />
                            <div className="absolute bottom-0 left-0 p-8 text-white">
                                {isLoginPage ? (
                                    <>
                                        <h2 className="text-2xl font-bold mb-2">
                                            Đăng nhập vào Aliconcon
                                        </h2>
                                        <p className="text-blue-50 max-w-md">
                                            Truy cập tài khoản của bạn và tiếp tục hành trình mua
                                            sắm.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold mb-2">
                                            Tham gia Aliconcon ngay
                                        </h2>
                                        <p className="text-blue-50 max-w-md">
                                            Khám phá xu hướng thời trang mới nhất và tận hưởng ưu
                                            đãi độc quyền khi tạo tài khoản.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-6 border-t border-blue-100 bg-white/70 backdrop-blur-md">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500">
                    <p>© 2023 Aliconcon. Bảo lưu mọi quyền.</p>
                </div>
            </footer>
        </div>
    );
}
