'use client';

import { Button } from '@/components/ui/button';
import { Camera, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface CaptureScreenshotProps {
    orderId?: string;
}

export default function CaptureScreenshot({ orderId }: CaptureScreenshotProps) {
    const { toast } = useToast();

    const captureScreenshot = async () => {
        try {
            // Find the payment card element
            const element = document.querySelector('[data-payment-card]') as HTMLElement;
            if (!element) {
                toast({
                    title: 'Lỗi chụp ảnh',
                    description: 'Không tìm thấy nội dung để chụp ảnh',
                    variant: 'destructive'
                });
                return;
            }

            // Hide the capture button temporarily
            const captureButton = document.querySelector('[data-capture-button]') as HTMLElement;
            if (captureButton) {
                captureButton.style.display = 'none';
            }

            // Configure html2canvas options with better compatibility
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                logging: false,
                width: element.scrollWidth,
                height: element.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                // Add options to handle modern CSS features
                foreignObjectRendering: false,
                removeContainer: true,
                // Ignore elements that might cause issues
                ignoreElements: (element) => {
                    // Skip elements with problematic CSS
                    const computedStyle = window.getComputedStyle(element);
                    const backgroundColor = computedStyle.backgroundColor;
                    const color = computedStyle.color;

                    // Skip elements with oklch or other unsupported color functions
                    if (backgroundColor.includes('oklch') || color.includes('oklch')) {
                        return true;
                    }

                    return false;
                },
                // Override problematic styles
                onclone: (clonedDoc) => {
                    // Find all elements in the cloned document
                    const allElements = clonedDoc.querySelectorAll('*');

                    allElements.forEach((el) => {
                        const element = el as HTMLElement;
                        const computedStyle = window.getComputedStyle(element);

                        // Replace oklch colors with fallback colors
                        if (computedStyle.backgroundColor.includes('oklch')) {
                            element.style.backgroundColor = '#ffffff';
                        }
                        if (computedStyle.color.includes('oklch')) {
                            element.style.color = '#000000';
                        }
                        if (computedStyle.borderColor.includes('oklch')) {
                            element.style.borderColor = '#e5e7eb';
                        }

                        // Handle gradient backgrounds that might use oklch
                        const backgroundImage = computedStyle.backgroundImage;
                        if (backgroundImage.includes('oklch')) {
                            element.style.backgroundImage = 'none';
                            element.style.backgroundColor = '#f9fafb';
                        }
                    });
                }
            });

            // Show the capture button again
            if (captureButton) {
                captureButton.style.display = '';
            }

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        toast({
                            title: 'Lỗi chụp ảnh',
                            description: 'Không thể tạo file ảnh',
                            variant: 'destructive'
                        });
                        return;
                    }

                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;

                    // Generate filename with timestamp
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const orderSuffix = orderId ? `_${orderId.slice(-8)}` : '';
                    link.download = `vnpay-bill${orderSuffix}_${timestamp}.png`;

                    // Trigger download
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    // Clean up
                    URL.revokeObjectURL(url);

                    toast({
                        title: 'Chụp ảnh thành công!',
                        description: 'Bill thanh toán đã được lưu vào máy của bạn',
                        variant: 'default'
                    });
                },
                'image/png',
                0.95
            );
        } catch (error) {
            console.error('Screenshot error:', error);
            toast({
                title: 'Lỗi chụp ảnh',
                description: 'Có lỗi xảy ra khi chụp ảnh. Vui lòng thử lại.',
                variant: 'destructive'
            });
        }
    };

    return (
        <Button
            onClick={captureScreenshot}
            variant="outline"
            className="w-full bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-200 hover:border-purple-300"
            data-capture-button
        >
            <Camera className="h-4 w-4 mr-2" />
            Chụp ảnh Bill
        </Button>
    );
}
