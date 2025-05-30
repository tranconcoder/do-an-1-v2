'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    RotateCcw,
    ShoppingCart,
    Heart,
    Search,
    User,
    Package,
    CreditCard,
    Star,
    MapPin,
    Truck,
    Shield,
    Gift,
    Smartphone,
    CheckCircle
} from 'lucide-react';

interface TourStep {
    id: number;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    image?: string;
    features: string[];
    tips?: string[];
}

const tourSteps: TourStep[] = [
    {
        id: 1,
        title: 'Chào mừng đến với cửa hàng trực tuyến',
        description:
            'Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất. Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất.',
        icon: ShoppingCart,
        features: [
            'Hàng ngàn sản phẩm đa dạng',
            'Giá cả cạnh tranh',
            'Chất lượng được đảm bảo',
            'Giao hàng toàn quốc'
        ],
        tips: [
            'Đăng ký tài khoản để nhận ưu đãi đặc biệt',
            'Theo dõi các chương trình khuyến mãi hàng tuần'
        ]
    },
    {
        id: 2,
        title: 'Tìm kiếm sản phẩm dễ dàng',
        description:
            'Sử dụng thanh tìm kiếm thông minh để nhanh chóng tìm thấy sản phẩm bạn cần. Lọc theo danh mục, giá cả và đánh giá.',
        icon: Search,
        features: [
            'Tìm kiếm thông minh với AI',
            'Lọc theo nhiều tiêu chí',
            'Gợi ý sản phẩm liên quan',
            'Lịch sử tìm kiếm'
        ],
        tips: [
            'Sử dụng từ khóa cụ thể để tìm kiếm chính xác hơn',
            'Thử các bộ lọc để thu hẹp kết quả'
        ]
    },
    {
        id: 3,
        title: 'Quản lý giỏ hàng thông minh',
        description:
            'Thêm sản phẩm vào giỏ hàng, điều chỉnh số lượng và theo dõi tổng tiền một cách dễ dàng.',
        icon: ShoppingCart,
        features: [
            'Thêm/xóa sản phẩm nhanh chóng',
            'Cập nhật số lượng tự động',
            'Tính toán giá tự động',
            'Lưu giỏ hàng cho lần sau'
        ],
        tips: ['Kiểm tra kho hàng trước khi đặt', 'Áp dụng mã giảm giá nếu có']
    },
    {
        id: 4,
        title: 'Danh sách yêu thích',
        description:
            'Lưu những sản phẩm bạn quan tâm vào danh sách yêu thích để dễ dàng theo dõi và mua sau.',
        icon: Heart,
        features: [
            'Lưu sản phẩm yêu thích',
            'Theo dõi thay đổi giá',
            'Nhận thông báo khuyến mãi',
            'Chia sẻ với bạn bè'
        ],
        tips: ['Thêm vào yêu thích để nhận thông báo giảm giá', 'Kiểm tra danh sách thường xuyên']
    },
    {
        id: 5,
        title: 'Thanh toán an toàn',
        description:
            'Nhiều phương thức thanh toán tiện lợi và bảo mật. Thông tin của bạn được mã hóa và bảo vệ tuyệt đối.',
        icon: CreditCard,
        features: [
            'Thanh toán khi nhận hàng (COD)',
            'Chuyển khoản ngân hàng',
            'Ví điện tử VNPay',
            'Thẻ tín dụng/ghi nợ'
        ],
        tips: [
            'Kiểm tra thông tin đơn hàng trước khi thanh toán',
            'Lưu thông tin thanh toán cho lần sau'
        ]
    },
    {
        id: 6,
        title: 'Theo dõi đơn hàng',
        description: 'Theo dõi trạng thái đơn hàng từ lúc đặt hàng đến khi nhận được sản phẩm.',
        icon: Package,
        features: [
            'Cập nhật trạng thái real-time',
            'Thông báo qua email/SMS',
            'Lịch sử đơn hàng chi tiết',
            'Đánh giá sau khi nhận hàng'
        ],
        tips: ['Kiểm tra email để nhận thông báo cập nhật', 'Liên hệ hỗ trợ nếu có vấn đề']
    },
    {
        id: 7,
        title: 'Giao hàng nhanh chóng',
        description:
            'Dịch vụ giao hàng nhanh chóng với nhiều tùy chọn thời gian và địa điểm nhận hàng.',
        icon: Truck,
        features: [
            'Giao hàng trong ngày',
            'Giao hàng theo lịch hẹn',
            'Nhiều điểm nhận hàng',
            'Theo dõi shipper real-time'
        ],
        tips: ['Chọn thời gian giao hàng phù hợp', 'Chuẩn bị sẵn tiền mặt nếu thanh toán COD']
    },
    {
        id: 8,
        title: 'Hỗ trợ khách hàng 24/7',
        description:
            'Đội ngũ hỗ trợ khách hàng chuyên nghiệp sẵn sàng giúp đỡ bạn mọi lúc, mọi nơi.',
        icon: Shield,
        features: ['Chat trực tuyến 24/7', 'Hotline miễn phí', 'Email hỗ trợ', 'FAQ chi tiết'],
        tips: ['Sử dụng chat để được hỗ trợ nhanh nhất', 'Chuẩn bị thông tin đơn hàng khi liên hệ']
    }
];

export default function TourDetailPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Auto-play functionality
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        handleNextStep();
                        return 0;
                    }
                    return prev + 2;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep]);

    const handleNextStep = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
            setProgress(0);
        } else {
            setIsPlaying(false);
            setProgress(0);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setProgress(0);
        }
    };

    const handleStepClick = (stepIndex: number) => {
        setCurrentStep(stepIndex);
        setProgress(0);
        setIsPlaying(false);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            setProgress(0);
        }
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setProgress(0);
        setIsPlaying(false);
    };

    const handleStartShopping = () => {
        router.push('/products');
    };

    const currentTourStep = tourSteps[currentStep];
    const StepIcon = currentTourStep.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Hướng dẫn sử dụng</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Khám phá các tính năng tuyệt vời của cửa hàng trực tuyến và trở thành người
                        mua sắm thông minh
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Bước {currentStep + 1} / {tourSteps.length}
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round(((currentStep + 1) / tourSteps.length) * 100)}% hoàn thành
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Step Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Package className="h-5 w-5" />
                                    <span>Các bước hướng dẫn</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {tourSteps.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => handleStepClick(index)}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${
                                                index === currentStep
                                                    ? 'bg-blue-100 border-2 border-blue-500 text-blue-700'
                                                    : index < currentStep
                                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`p-2 rounded-full ${
                                                        index === currentStep
                                                            ? 'bg-blue-500 text-white'
                                                            : index < currentStep
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-gray-300 text-gray-600'
                                                    }`}
                                                >
                                                    {index < currentStep ? (
                                                        <CheckCircle className="h-4 w-4" />
                                                    ) : (
                                                        <Icon className="h-4 w-4" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">
                                                        {step.title}
                                                    </p>
                                                    <p className="text-xs opacity-75 line-clamp-2">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Current Step Card */}
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-white/20 rounded-full">
                                            <StepIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">
                                                {currentTourStep.title}
                                            </CardTitle>
                                            <p className="text-blue-100 mt-1">
                                                Bước {currentStep + 1} / {tourSteps.length}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="bg-white/20 text-white border-white/30"
                                    >
                                        {Math.round(((currentStep + 1) / tourSteps.length) * 100)}%
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                                    {currentTourStep.description}
                                </p>

                                {/* Features */}
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                        Tính năng nổi bật
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {currentTourStep.features.map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2"
                                            >
                                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tips */}
                                {currentTourStep.tips && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                                            <Gift className="h-4 w-4 mr-2" />
                                            Mẹo hữu ích
                                        </h3>
                                        <ul className="space-y-1">
                                            {currentTourStep.tips.map((tip, index) => (
                                                <li
                                                    key={index}
                                                    className="text-yellow-700 text-sm flex items-start"
                                                >
                                                    <span className="text-yellow-500 mr-2">•</span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Controls */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePrevStep}
                                            disabled={currentStep === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Trước
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePlayPause}
                                        >
                                            {isPlaying ? (
                                                <Pause className="h-4 w-4 mr-1" />
                                            ) : (
                                                <Play className="h-4 w-4 mr-1" />
                                            )}
                                            {isPlaying ? 'Tạm dừng' : 'Tự động'}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleRestart}>
                                            <RotateCcw className="h-4 w-4 mr-1" />
                                            Bắt đầu lại
                                        </Button>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        {currentStep === tourSteps.length - 1 ? (
                                            <Button
                                                onClick={handleStartShopping}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500"
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-2" />
                                                Bắt đầu mua sắm
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleNextStep}
                                                className="bg-gradient-to-r from-blue-500 to-purple-500"
                                            >
                                                Tiếp theo
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Auto-play progress */}
                                {isPlaying && (
                                    <div className="mt-3">
                                        <Progress value={progress} className="h-1" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Smartphone className="h-5 w-5" />
                                    <span>Thao tác nhanh</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center space-y-2"
                                        onClick={() => router.push('/products')}
                                    >
                                        <Search className="h-6 w-6 text-blue-500" />
                                        <span className="text-sm">Tìm sản phẩm</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center space-y-2"
                                        onClick={() => router.push('/categories')}
                                    >
                                        <Package className="h-6 w-6 text-green-500" />
                                        <span className="text-sm">Danh mục</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center space-y-2"
                                        onClick={() => router.push('/cart')}
                                    >
                                        <ShoppingCart className="h-6 w-6 text-orange-500" />
                                        <span className="text-sm">Giỏ hàng</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-center space-y-2"
                                        onClick={() => router.push('/profile')}
                                    >
                                        <User className="h-6 w-6 text-purple-500" />
                                        <span className="text-sm">Tài khoản</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
