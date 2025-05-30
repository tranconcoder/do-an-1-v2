import { Slider } from '@/components/ui/slider';

interface PriceRangeFilterProps {
    priceRange: [number, number];
    onPriceRangeChange: (value: [number, number]) => void;
}

// Helper function to format VND currency
const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const PriceRangeFilter = ({ priceRange, onPriceRangeChange }: PriceRangeFilterProps) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-blue-600 mr-2">₫</span>
                Khoảng giá
            </h3>
            <div className="space-y-3">
                <Slider
                    value={priceRange}
                    onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                    max={50000000}
                    step={1000000}
                    className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-blue-600 font-medium">
                    <span>{formatVND(priceRange[0])}</span>
                    <span>{formatVND(priceRange[1])}</span>
                </div>
            </div>
        </div>
    );
};

export default PriceRangeFilter;
