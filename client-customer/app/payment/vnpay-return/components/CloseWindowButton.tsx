'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CloseWindowButtonProps {
    inline?: boolean;
}

export default function CloseWindowButton({ inline = false }: CloseWindowButtonProps) {
    const handleCloseWindow = () => {
        if (typeof window !== 'undefined') {
            window.close();
        }
    };

    if (inline) {
        return (
            <Button
                onClick={handleCloseWindow}
                variant="outline"
                className="w-full bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 text-gray-700 border-gray-200 hover:border-gray-300"
            >
                <X className="h-4 w-4 mr-2" />
                Đóng
            </Button>
        );
    }

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
