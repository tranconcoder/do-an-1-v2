'use client';

import { Palette } from 'lucide-react';
import { ProductVariation } from '@/lib/services/api/productService';

interface ProductVariantsProps {
  variations: ProductVariation[];
  selectedVariations: {[key: string]: number};
  onVariationChange: (variationId: string, valueIndex: number) => void;
}

export default function ProductVariants({ 
  variations, 
  selectedVariations, 
  onVariationChange 
}: ProductVariantsProps) {
  if (!variations || variations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <Palette className="h-5 w-5 mr-2 text-blue-600" /> Chọn tùy chọn
      </h3>
      
      {variations.map((variation, variationIndex) => (
        <div key={variation._id} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {variation.variation_name}:
          </label>
          <div className="flex flex-wrap gap-2">
            {variation.variation_values.map((value, valueIndex) => {
              const isSelected = selectedVariations[variation._id] === valueIndex;
              return (
                <button
                  key={valueIndex}
                  onClick={() => onVariationChange(variation._id, valueIndex)}
                  className={`px-4 py-2 rounded-md border transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium shadow-md'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Current Selection Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Lựa chọn hiện tại:</h4>
        <div className="flex flex-wrap gap-2">
          {variations.map((variation, index) => {
            const selectedIndex = selectedVariations[variation._id] ?? 0;
            const selectedValue = variation.variation_values[selectedIndex];
            return (
              <div key={variation._id} className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-md border border-blue-300 shadow-sm">
                <span className="text-sm font-medium text-gray-700">{variation.variation_name}:</span>
                <span className="text-sm text-blue-700 font-semibold ml-1">{selectedValue}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}