'use client';

import { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { X, ChevronRight, ChevronLeft, ZoomIn, ZoomOut } from 'lucide-react';
import { mediaService } from '@/lib/services/api/mediaService';

interface ImageModalProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  productName: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ImageModal({ 
  isOpen, 
  images, 
  currentIndex, 
  productName, 
  onClose, 
  onPrevious, 
  onNext 
}: ImageModalProps) {
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const zoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setImageZoom(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const closeImageModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      onClose();
      setIsModalClosing(false);
      resetZoom();
    }, 200);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onPrevious, onNext]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isModalClosing 
          ? 'bg-black bg-opacity-0 opacity-0' 
          : 'bg-black bg-opacity-90 opacity-100'
      }`}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className={`relative w-full h-full flex items-center justify-center p-4 transition-transform duration-300 ${
        isModalClosing ? 'scale-95' : 'scale-100'
      }`}>
        {/* Loading Overlay for Modal */}
        {isImageLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 transition-opacity duration-200">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-white">Loading image...</span>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={closeImageModal}
          className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 disabled:hover:scale-100"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button
            onClick={zoomIn}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            disabled={imageZoom >= 3}
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            disabled={imageZoom <= 0.5}
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 text-xs text-white font-medium hover:scale-110"
          >
            Reset
          </button>
          
          {/* Zoom Level Indicator */}
          <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white text-center font-medium">
            {Math.round(imageZoom * 100)}%
          </div>
        </div>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Main Image */}
        <div 
          className={`relative max-w-full max-h-full overflow-hidden transition-all duration-300 ease-out ${
            imageZoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            transform: `scale(${imageZoom}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseDown={(e) => {
            if (imageZoom > 1) {
              setIsDragging(true);
              const startX = e.clientX - imagePosition.x;
              const startY = e.clientY - imagePosition.y;
              
              const handleMouseMove = (e: MouseEvent) => {
                setImagePosition({
                  x: e.clientX - startX,
                  y: e.clientY - startY
                });
              };
              
              const handleMouseUp = () => {
                setIsDragging(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }}
          onDoubleClick={() => {
            if (imageZoom === 1) {
              setImageZoom(2);
            } else {
              resetZoom();
            }
          }}
        >
          <NextImage
            src={mediaService.getMediaUrl(images[currentIndex])}
            alt={`${productName} - Image ${currentIndex + 1}`}
            width={800}
            height={800}
            objectFit="contain"
            className={`max-w-full max-h-screen transition-opacity duration-300 ${
              isImageLoading ? 'opacity-50' : 'opacity-100'
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
            priority
          />
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-lg max-w-md overflow-x-auto">
            {images.map((imgId, index) => (
              <button
                key={imgId}
                onClick={() => {
                  setIsImageLoading(true);
                  setTimeout(() => {
                    setImageZoom(1);
                    setImagePosition({ x: 0, y: 0 });
                    setTimeout(() => setIsImageLoading(false), 150);
                  }, 100);
                }}
                className={`relative w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 hover:scale-110 ${
                  index === currentIndex 
                    ? 'border-white shadow-lg scale-110' 
                    : 'border-transparent hover:border-white/50'
                }`}
              >
                <NextImage
                  src={mediaService.getMediaUrl(imgId)}
                  alt={`Thumbnail ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="transition-opacity duration-200 hover:opacity-80"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 z-10 text-xs text-white bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex flex-col gap-1">
            <span>• Scroll to zoom</span>
            <span>• Double-click to toggle zoom</span>
            <span>• Drag to move when zoomed</span>
          </div>
        </div>
      </div>
    </div>
  );
}