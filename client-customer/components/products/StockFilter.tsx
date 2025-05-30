import { Checkbox } from '@/components/ui/checkbox';

interface StockFilterProps {
    inStock: boolean;
    onInStockChange: (checked: boolean) => void;
}

const StockFilter = ({ inStock, onInStockChange }: StockFilterProps) => {
    return (
        <div>
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <Checkbox
                    id="inStock"
                    checked={inStock}
                    onCheckedChange={(checked) => onInStockChange(!!checked)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                    htmlFor="inStock"
                    className="text-sm text-gray-700 cursor-pointer font-medium"
                >
                    Chỉ sản phẩm còn hàng
                </label>
            </div>
        </div>
    );
};

export default StockFilter;
