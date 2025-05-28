'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, RotateCw, ZoomIn, ZoomOut, Crop, Check, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface Point {
    x: number;
    y: number;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropperProps {
    open: boolean;
    onClose: () => void;
    imageSrc: string;
    onCropComplete: (croppedImage: string) => void;
    aspectRatio?: number;
    cropShape?: 'rect' | 'round';
    fileName?: string;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const rotRad = (rotation * Math.PI) / 180;

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // Set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw rotated image
    ctx.drawImage(image, 0, 0);

    // Crop the image
    const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

    // Set canvas width to final desired crop size
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
};

const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (rotation * Math.PI) / 180;
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
};

export default function ImageCropper({
    open,
    onClose,
    imageSrc,
    onCropComplete,
    aspectRatio = 1,
    cropShape = 'round',
    fileName = 'image'
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = useCallback((crop: Point) => {
        setCrop(crop);
    }, []);

    const onZoomChange = useCallback((zoom: number) => {
        setZoom(zoom);
    }, []);

    const onCropCompleteHandler = useCallback(
        (croppedArea: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleSave = useCallback(async () => {
        if (!croppedAreaPixels) return;

        try {
            setIsProcessing(true);
            
            // Get cropped image
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            );

            // Convert to blob for compression
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            
            // Create file for compression
            const file = new File([blob], fileName, { type: 'image/jpeg' });

            // Compress image
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
                quality: 0.8
            };

            const compressedFile = await imageCompression(file, options);
            
            // Convert compressed file back to data URL
            const compressedDataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(compressedFile);
            });

            onCropComplete(compressedDataUrl);
            onClose();
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [croppedAreaPixels, imageSrc, rotation, fileName, onCropComplete, onClose]);

    const resetCrop = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crop className="h-5 w-5" />
                        Chỉnh sửa ảnh đại diện
                    </DialogTitle>
                    <DialogDescription>
                        Cắt, xoay và điều chỉnh ảnh của bạn. Ảnh sẽ được tự động nén để tối ưu hóa.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Cropper Area */}
                    <div className="flex-1">
                        <Card>
                            <CardContent className="p-0">
                                <div className="relative h-96 lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                                    <Cropper
                                        image={imageSrc}
                                        crop={crop}
                                        rotation={rotation}
                                        zoom={zoom}
                                        aspect={aspectRatio}
                                        onCropChange={onCropChange}
                                        onRotationChange={setRotation}
                                        onCropComplete={onCropCompleteHandler}
                                        onZoomChange={onZoomChange}
                                        cropShape={cropShape}
                                        showGrid={true}
                                        style={{
                                            containerStyle: {
                                                width: '100%',
                                                height: '100%',
                                                backgroundColor: '#f8f9fa'
                                            }
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls */}
                    <div className="w-full lg:w-80 space-y-6">
                        {/* Zoom Control */}
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <ZoomIn className="h-4 w-4" />
                                        Thu phóng
                                    </label>
                                    <Badge variant="secondary">{Math.round(zoom * 100)}%</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ZoomOut className="h-4 w-4 text-gray-500" />
                                    <Slider
                                        value={[zoom]}
                                        onValueChange={(value) => setZoom(value[0])}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        className="flex-1"
                                    />
                                    <ZoomIn className="h-4 w-4 text-gray-500" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rotation Control */}
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <RotateCw className="h-4 w-4" />
                                        Xoay
                                    </label>
                                    <Badge variant="secondary">{rotation}°</Badge>
                                </div>
                                <Slider
                                    value={[rotation]}
                                    onValueChange={(value) => setRotation(value[0])}
                                    min={-180}
                                    max={180}
                                    step={1}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRotation(rotation - 90)}
                                        className="flex-1"
                                    >
                                        -90°
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRotation(rotation + 90)}
                                        className="flex-1"
                                    >
                                        +90°
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Image Info */}
                        <Card>
                            <CardContent className="p-4 space-y-2">
                                <h4 className="text-sm font-medium">Thông tin ảnh</h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div>Định dạng: JPEG (nén)</div>
                                    <div>Chất lượng: Cao (80%)</div>
                                    <div>Kích thước tối đa: 1MB</div>
                                    <div>Độ phân giải: 1024px</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            onClick={resetCrop}
                            className="w-full"
                        >
                            Đặt lại
                        </Button>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isProcessing || !croppedAreaPixels}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                        {isProcessing ? 'Đang xử lý...' : 'Lưu ảnh'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 