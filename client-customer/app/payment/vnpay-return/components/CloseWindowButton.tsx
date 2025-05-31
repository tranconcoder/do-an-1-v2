'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function CloseWindowButton() {
    const handleCloseWindow = () => {
        if (typeof window !== 'undefined') {
            window.close();
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <Button
                onClick={handleCloseWindow}
                variant="outline"
                size="sm"
                className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-gray-200"
            >
                <X className="h-4 w-4 mr-1" />
                Đóng
            </Button>
        </div>
    );
}
