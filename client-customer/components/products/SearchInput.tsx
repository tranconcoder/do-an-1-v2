import { memo, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
    defaultValue: string;
    onChange: (value: string) => void;
    isSearching: boolean;
}

const SearchInput = memo(({ defaultValue, onChange, isSearching }: SearchInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Search className="h-4 w-4 mr-2 text-blue-600" />
                Tìm kiếm
            </h3>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                    ref={inputRef}
                    placeholder="Tìm kiếm sản phẩm..."
                    defaultValue={defaultValue}
                    onChange={handleInputChange}
                    className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                />
            </div>
            {isSearching && (
                <div className="mt-1 text-xs text-blue-500 flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-1"></div>
                    Đang tìm kiếm...
                </div>
            )}
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
