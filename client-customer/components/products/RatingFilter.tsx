import { Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface RatingFilterProps {
    selectedRating: number;
    onRatingChange: (rating: number) => void;
}

const RatingFilter = ({ selectedRating, onRatingChange }: RatingFilterProps) => {
    return (
        <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Star className="h-4 w-4 mr-2 text-yellow-400 fill-yellow-400" />
                Đánh giá tối thiểu
            </h3>
            <div className="space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                    <div
                        key={rating}
                        className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                        <Checkbox
                            id={`rating-${rating}`}
                            checked={selectedRating === rating}
                            onCheckedChange={(checked) => {
                                onRatingChange(checked ? rating : 0);
                            }}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <label
                            htmlFor={`rating-${rating}`}
                            className="flex items-center space-x-1 cursor-pointer"
                        >
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 transition-colors duration-200 ${
                                            i < rating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-700">trở lên</span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingFilter;
