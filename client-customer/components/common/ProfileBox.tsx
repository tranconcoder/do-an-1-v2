"use client"

import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import NextImage from 'next/image';
import { RootState, AppDispatch } from '@/lib/store/store';
import { logout } from '@/lib/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { LogOut, UserCircle, ShoppingCart, Heart } from 'lucide-react';
import { mediaService } from '@/lib/services/api/mediaService';
import { Badge } from '@/components/ui/badge';

export default function ProfileBox() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, accessToken } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    // Optionally, redirect to home or login page after logout
    // router.push('/'); 
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          asChild
        >
          <Link href="/auth/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-blue-600">
        <Heart className="h-5 w-5" />
        <span className="sr-only">Wishlist</span>
      </Button>
      <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-blue-600">
        <ShoppingCart className="h-5 w-5" />
        <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-blue-600 text-white">
          0
        </Badge>
        <span className="sr-only">Cart</span>
      </Button>
      
      <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
        <NextImage
          src={user.user_avatar ? mediaService.getMediaUrl(user.user_avatar) : '/placeholder-person.svg'}
          alt={user.user_fullName || 'User Avatar'}
          width={32}
          height={32}
          className="rounded-full bg-gray-200 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-person.svg';
            target.srcset = '';
          }}
        />
        <div className="text-sm">
          <div className="font-medium text-gray-700 truncate max-w-[100px]">{user.user_fullName || 'User'}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-red-600" title="Logout">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </div>
  );
} 