'use client';

import { useEffect, useState } from 'react';
import { User, Shop } from '@/lib/store/slices/userSlice';
import userService from '@/lib/services/api/userService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await userService.getProfile();
        setUser(profileData.user);
        setShop(profileData.shop || null); // Set shop data, default to null if not present
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again.');
        setUser(null);
        setShop(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []); // Empty dependency array means this effect runs only once on mount

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1 w-full sm:w-auto">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            {/* Shop Skeleton */}
            <Skeleton className="h-5 w-1/4 mt-6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally not happen if error is handled, but as a fallback
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.user_avatar} alt={`${user.user_fullName}'s avatar`} />
            <AvatarFallback>{user.user_fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1 w-full sm:w-auto">
            <CardTitle className="text-2xl font-bold">{user.user_fullName}</CardTitle>
            <CardDescription>{user.user_email}</CardDescription>
            <p className="text-sm text-gray-500">{user.phoneNumber}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Role</h3>
            <p>{user.role_name}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <p>{user.user_status}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Sex</h3>
            <p>{user.user_sex === '1' ? 'Male' : (user.user_sex === '0' ? 'Female' : user.user_sex)}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Date of Birth</h3>
            <p>{user.user_dayOfBirth}</p>
          </div>

          {shop && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                Shop Information
              </h3>
              <p>Name: {shop.shop_name}</p>
              {/* You can add more shop details here as needed */}
              {/* <p>Type: {shop.shop_type}</p> */}
              {/* <p>Status: {shop.shop_status}</p> */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

