'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { LayoutGrid, Maximize2 } from 'lucide-react';
import { mediaService } from '@/lib/services/api/mediaService';

interface ImageGalleryProps {
  images: string[];
  productName: string;
  onImageClick: (index: number) => void;
}

export default function ImageGallery({ images, productName, onImageClick }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>(images[0] ? mediaService.getMediaUrl(images[0]) : '');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleThumbnailClick = (imgId: string, index: number) => {
    const imageUrl = mediaService.getMediaUrl(imgId);
    setSelectedImage(imageUrl);
    setSelectedIndex(index);
  };

  return (
    <div className='md:sticky md:top-24'>
      <div 
        className="relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm mb-3 cursor-zoom-in group"
        onClick={() => onImageClick(selectedIndex)}
      >
        {/* Loading Overlay */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 transition-opacity duration-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Loading...</span>
            </div>
          </div>
        )}
        
        {selectedImage ? (
          <>
            <NextImage
              src={selectedImage}
              alt={productName}
              layout="fill"
              objectFit="contain"
              className="transition-all duration-500 ease-in-out group-hover:scale-105"
              onLoadingComplete={(image) => {
                image.classList.remove('opacity-0');
                setIsImageLoading(false);
              }}
              onLoadStart={() => setIsImageLoading(true)}
              onError={() => {
                if (selectedImage !== '/placeholder.svg') {
                    setSelectedImage('/placeholder.svg');
                }
                setIsImageLoading(false);
              }}
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 bg-white bg-opacity-90 rounded-full p-2">
                <Maximize2 className="w-6 h-6 text-gray-700" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <LayoutGrid className="w-20 h-20 text-gray-300" />
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((imgId, index) => (
            <button
              key={imgId}
              onClick={() => handleThumbnailClick(imgId, index)}
              className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                mediaService.getMediaUrl(imgId) === selectedImage 
                  ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-1 shadow-md scale-105' 
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <NextImage
                src={mediaService.getMediaUrl(imgId)}
                alt={`${productName} thumbnail`}
                layout="fill"
                objectFit="cover"
                className="bg-gray-50 transition-all duration-300 hover:brightness-110"
                onLoadingComplete={(image) => image.classList.remove('opacity-0')}
                onError={(e) => { 
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                  target.srcset = '';
                }}
              />
              {/* Selection indicator */}
              {mediaService.getMediaUrl(imgId) === selectedImage && (
                <div className="absolute inset-0 bg-blue-600 bg-opacity-10 flex items-center justify-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}