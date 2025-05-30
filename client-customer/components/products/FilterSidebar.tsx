import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/services/api/categoryService';
import SearchInput from './SearchInput';
import CategoryFilter from './CategoryFilter';
import PriceRangeFilter from './PriceRangeFilter';
import StockFilter from './StockFilter';
import RatingFilter from './RatingFilter';

interface HierarchicalCategory extends Category {
    children: HierarchicalCategory[];
}

interface FilterState {
    categories: string[];
    priceRange: [number, number];
    inStock: boolean;
    rating: number;
}

interface FilterSidebarProps {
    searchInputValue: string;
    isSearching: boolean;
    categoriesHierarchy: HierarchicalCategory[];
    filters: FilterState;
    onSearchChange: (value: string) => void;
    onCategoryChange: (categoryId: string, checked: boolean) => void;
    onPriceRangeChange: (value: [number, number]) => void;
    onInStockChange: (checked: boolean) => void;
    onRatingChange: (rating: number) => void;
    onClearFilters: () => void;
}

const FilterSidebar = ({
    searchInputValue,
    isSearching,
    categoriesHierarchy,
    filters,
    onSearchChange,
    onCategoryChange,
    onPriceRangeChange,
    onInStockChange,
    onRatingChange,
    onClearFilters
}: FilterSidebarProps) => {
    return (
        <div className="space-y-6 backdrop-blur-sm bg-white/80 p-6 rounded-2xl border border-white/20 shadow-xl">
            {/* Search */}
            <SearchInput
                defaultValue={searchInputValue}
                onChange={onSearchChange}
                isSearching={isSearching}
            />

            {/* Categories */}
            <CategoryFilter
                categoriesHierarchy={categoriesHierarchy}
                selectedCategories={filters.categories}
                onCategoryChange={onCategoryChange}
            />

            {/* Price Range */}
            <PriceRangeFilter
                priceRange={filters.priceRange}
                onPriceRangeChange={onPriceRangeChange}
            />

            {/* Stock Filter */}
            <StockFilter inStock={filters.inStock} onInStockChange={onInStockChange} />

            {/* Rating Filter */}
            <RatingFilter selectedRating={filters.rating} onRatingChange={onRatingChange} />

            {/* Clear Filters */}
            <Button
                variant="outline"
                onClick={onClearFilters}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
                <X className="h-4 w-4 mr-2" />
                Xóa tất cả bộ lọc
            </Button>
        </div>
    );
};

export default FilterSidebar;
