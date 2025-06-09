'use client';

import { Info, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ProductAttribute } from '@/lib/services/api/productService';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';

interface ProductDescriptionProps {
    description?: string;
    attributes?: ProductAttribute[];
}

export default function ProductDescription({ description, attributes }: ProductDescriptionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" /> Mô tả sản phẩm
                </h3>
                <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                    {description ? (
                        <MarkdownRenderer
                            content={description}
                            className="product-description-content"
                        />
                    ) : (
                        <p>Không có mô tả cho sản phẩm này.</p>
                    )}
                </div>
            </div>

            {attributes && attributes.length > 0 && (
                <div className="pt-2">
                    <Separator className="!my-5" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <Tag className="h-5 w-5 mr-2 text-blue-600" /> Thông số kỹ thuật
                    </h3>
                    <ul className="space-y-1.5 text-sm">
                        {attributes.map((attr: ProductAttribute, index: number) => (
                            <li
                                key={index}
                                className="flex justify-between items-center border-b border-gray-100 py-2 last:border-b-0"
                            >
                                <span className="text-gray-600 font-medium">{attr.attr_name}:</span>
                                <span className="text-gray-800 text-right">{attr.attr_value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
