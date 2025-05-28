'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ProductBreadcrumbs() {
  const router = useRouter();

  return (
    <nav className="mb-6">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="p-0 h-auto font-normal text-gray-600 hover:text-gray-800 hover:bg-transparent"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Products
      </Button>
    </nav>
  );
}