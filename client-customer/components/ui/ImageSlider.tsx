"use client"

import React, { useState, useEffect } from "react"
import { default as NextImage } from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button" // Assuming you have a Button component

interface ImageSliderProps {
  images: string[]
  imageAltText?: string[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  showArrows?: boolean
  imageHeightClass?: string // e.g., "h-96" or "h-[500px]"
  imageWidthClass?: string // e.g., "w-full"
  objectFitClass?: string // e.g., "object-cover", "object-contain"
  roundedClass?: string // e.g., "rounded-xl"
}

export function ImageSlider({
  images,
  imageAltText,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
  imageHeightClass = "h-[400px]", // Default height
  imageWidthClass = "w-full",
  objectFitClass = "object-cover",
  roundedClass = "rounded-xl",
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1
    const newIndex = isLastSlide ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex)
  }

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      goToNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [currentIndex, autoPlay, autoPlayInterval])

  if (!images || images.length === 0) {
    return <div className={`relative ${imageWidthClass} ${imageHeightClass} ${roundedClass} bg-gray-200 flex items-center justify-center text-gray-500`}>No images to display</div>;
  }

  return (
    <div className={`relative ${imageWidthClass} ${imageHeightClass} overflow-hidden ${roundedClass} shadow-xl group`}>
      <div
        className="relative w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <div key={index} className="absolute top-0 left-0 w-full h-full" style={{ transform: `translateX(${index * 100}%)` }}>
            <NextImage
              src={src}
              alt={imageAltText && imageAltText[index] ? imageAltText[index] : `Slide ${index + 1}`}
              fill
              className={`${objectFitClass}`}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {showArrows && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute top-1/2 left-4 -translate-y-1/2 z-10 bg-white/50 hover:bg-white/80 text-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-white/50 hover:bg-white/80 text-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
          {images.map((_, slideIndex) => (
            <button
              key={slideIndex}
              onClick={() => goToSlide(slideIndex)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentIndex === slideIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${slideIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}