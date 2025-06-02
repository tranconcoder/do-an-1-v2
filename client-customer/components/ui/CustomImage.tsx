'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { cn } from '@/lib/utils';

interface CustomImageProps {
    src: string;
    alt: string;
    fallbackSrc?: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    priority?: boolean;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    sizes?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
}

export const CustomImage: React.FC<CustomImageProps> = ({
    src,
    alt,
    fallbackSrc = '/placeholder.png',
    width,
    height,
    fill = false,
    className = '',
    objectFit = 'cover',
    priority = false,
    quality = 75,
    placeholder = 'empty',
    blurDataURL,
    sizes,
    style,
    onLoad,
    onError,
    ...props
}) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset state when src changes
    useEffect(() => {
        setCurrentSrc(src);
        setHasError(false);
        setIsLoading(true);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        if (!hasError && currentSrc !== fallbackSrc) {
            setHasError(true);
            setCurrentSrc(fallbackSrc);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
        onError?.();
    };

    // Common props for Next.js Image
    const imageProps = {
        src: currentSrc,
        alt: alt,
        priority,
        quality,
        placeholder,
        blurDataURL,
        sizes,
        style,
        onLoad: handleLoad,
        onError: handleError,
        className: cn('transition-opacity duration-300', isLoading && 'opacity-50', className),
        ...props
    };

    if (fill) {
        return (
            <NextImage
                {...imageProps}
                fill
                style={{
                    objectFit,
                    ...style
                }}
            />
        );
    }

    return (
        <NextImage
            {...imageProps}
            width={width}
            height={height}
            style={{
                objectFit,
                ...style
            }}
        />
    );
};

export default CustomImage;
