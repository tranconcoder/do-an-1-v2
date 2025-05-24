'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import authService from '@/lib/services/api/authService';
import { useEffect } from 'react';

enum Step {
    EMAIL,
    OTP,
    NEW_PASSWORD,
    SUCCESS
}

// Add retry time constant (client-side approximation of server config)
const RESEND_OTP_RETRY_TIME_SECONDS = 30; // 30 seconds

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>(Step.EMAIL);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add state for resend timer and status
    const [resendTimer, setResendTimer] = useState(0);
    const [isResending, setIsResending] = useState(false);

    // Form data
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [token, setToken] = useState<any>(null);

    // Effect to manage the resend timer countdown
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (currentStep === Step.OTP && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prevTime) => prevTime - 1);
            }, 1000);
        }

        // Cleanup function to clear the interval
        return () => clearInterval(timer);
    }, [currentStep, resendTimer]);

    // Step 1: Submit email to send OTP
    const handleSendOTP = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.sendOTP({ email });
            setCurrentStep(Step.OTP);
            setResendTimer(RESEND_OTP_RETRY_TIME_SECONDS); // Start timer on successful send
        } catch (err: any) {
            console.error('Send OTP error:', err);
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Gửi mã OTP thất bại. Vui lòng thử lại.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle resending OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0 || isResending) {
            return; // Prevent resending if timer is active or already resending
        }

        setIsResending(true);
        setError(null); // Clear previous errors

        try {
            await authService.sendOTP({ email });
            setResendTimer(RESEND_OTP_RETRY_TIME_SECONDS); // Restart timer
            // Optionally show a brief success message here
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Gửi lại mã OTP thất bại. Vui lòng thử lại.'
            );
        } finally {
            setIsResending(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await authService.verifyOTP({ email, otp });
            setToken(response.metadata.token);
            setCurrentStep(Step.NEW_PASSWORD);
        } catch (err: any) {
            console.error('Verify OTP error:', err);
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Mã OTP không hợp lệ. Vui lòng thử lại.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu không khớp');
            setIsLoading(false);
            return;
        }

        try {
            await authService.forgotPassword({
                email,
                newPassword,
                accessToken: token.accessToken
            });
            setCurrentStep(Step.SUCCESS);
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Render different form based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case Step.EMAIL:
                return (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Nhập địa chỉ email của bạn"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Gửi mã OTP
                        </Button>
                    </form>
                );
            case Step.OTP:
                return (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Mã OTP</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Nhập mã OTP đã gửi đến email của bạn"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={isLoading || isResending}
                            />
                            <p className="text-sm text-gray-500">
                                Chúng tôi đã gửi mã xác minh đến {email}
                                {resendTimer > 0 && (
                                    <span className="ml-2 text-blue-600 font-medium">
                                        ({resendTimer}s)
                                    </span>
                                )}
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center justify-center"
                            disabled={isLoading || isResending}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xác minh OTP
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleResendOTP}
                            disabled={resendTimer > 0 || isResending || isLoading}
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi
                                    lại...
                                </>
                            ) : resendTimer > 0 ? (
                                `Gửi lại sau ${resendTimer}s`
                            ) : (
                                'Gửi lại mã OTP'
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full"
                            onClick={() => setCurrentStep(Step.EMAIL)}
                            disabled={isLoading || isResending}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                    </form>
                );
            case Step.NEW_PASSWORD:
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Mật khẩu mới</Label>
                            <Input
                                id="new-password"
                                type="password"
                                placeholder="Nhập mật khẩu mới"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Xác nhận mật khẩu mới"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center justify-center"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Đặt lại mật khẩu
                        </Button>
                    </form>
                );
            case Step.SUCCESS:
                return (
                    <div className="space-y-4 text-center">
                        <div className="rounded-full bg-green-100 p-3 inline-flex mx-auto">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium">Đặt lại mật khẩu thành công</h3>
                        <p className="text-gray-500">
                            Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng
                            nhập bằng mật khẩu mới.
                        </p>
                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                            onClick={() => router.push('/auth/login')}
                        >
                            Đi đến trang Đăng nhập
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Quên mật khẩu</h1>
                {currentStep === Step.EMAIL && (
                    <p className="text-muted-foreground">Nhập email của bạn để đặt lại mật khẩu</p>
                )}
                {currentStep === Step.OTP && (
                    <p className="text-muted-foreground">
                        Nhập mã OTP đã gửi đến email của bạn và xác minh
                    </p>
                )}
                {currentStep === Step.NEW_PASSWORD && (
                    <p className="text-muted-foreground">Tạo mật khẩu mới</p>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Lỗi</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mt-6">{renderStepContent()}</div>

            {/* Add link back to login page */}
            {currentStep !== Step.SUCCESS && (
                <div className="mt-4 text-center text-sm">
                    Nhớ mật khẩu rồi?{' '}
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            )}
        </>
    );
}
