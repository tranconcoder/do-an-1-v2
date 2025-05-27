import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function NewsletterSection() {
    return (
        <section className="py-16 bg-blue-50">
            <div className="container mx-auto px-4 max-w-4xl text-center">
                <div className="p-8 md:p-12 rounded-2xl backdrop-blur-md bg-white/70 border border-blue-100 shadow-sm">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Đăng ký nhận bản tin của chúng tôi
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Luôn cập nhật những xu hướng mới nhất, hàng mới về và các ưu đãi độc quyền.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="flex-1 bg-white border-blue-100"
                        />
                        <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                            Đăng ký
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
