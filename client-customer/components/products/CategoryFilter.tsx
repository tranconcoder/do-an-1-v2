import { Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Category } from '@/lib/services/api/categoryService';

interface HierarchicalCategory extends Category {
    children: HierarchicalCategory[];
}

interface CategoryFilterProps {
    categoriesHierarchy: HierarchicalCategory[];
    selectedCategories: string[];
    onCategoryChange: (categoryId: string, checked: boolean) => void;
}

const CategoryFilter = ({
    categoriesHierarchy,
    selectedCategories,
    onCategoryChange
}: CategoryFilterProps) => {
    // Recursively render category options with proper indentation
    const renderCategoryFilters = (
        categories: HierarchicalCategory[],
        level: number = 0
    ): React.ReactElement[] => {
        return categories.flatMap((category) => {
            const items: React.ReactElement[] = [
                <div
                    key={category._id}
                    className="flex items-center space-x-2 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                    style={{ paddingLeft: `${level * 16}px` }}
                >
                    <Checkbox
                        id={category._id}
                        checked={selectedCategories.includes(category._id)}
                        onCheckedChange={(checked) => {
                            onCategoryChange(category._id, !!checked);
                        }}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <label
                        htmlFor={category._id}
                        className="text-sm text-gray-700 cursor-pointer flex items-center hover:text-blue-600 transition-colors"
                    >
                        {level > 0 && <span className="text-blue-400 mr-1">{'└─ '}</span>}
                        {category.category_name}
                    </label>
                </div>
            ];

            // Add children if they exist
            if (category.children && category.children.length > 0) {
                items.push(...renderCategoryFilters(category.children, level + 1));
            }

            return items;
        });
    };

    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Filter className="h-4 w-4 mr-2 text-blue-600" />
                Danh mục
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50">
                {renderCategoryFilters(categoriesHierarchy)}
            </div>
        </div>
    );
};

export default CategoryFilter;
