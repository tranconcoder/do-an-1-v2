'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import Link from 'next/link';
import { User, Mail, ShoppingBag, Heart, LogOut, Edit3, Shield, MapPin } from 'lucide-react';

import { RootState } from '@/lib/store/store';
import { logout } from '@/lib/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mediaService } from '@/lib/services/api/mediaService';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, accessToken } = useSelector((state: RootState) => state.user);

  if (!accessToken || !user) {
    // Redirect to login if not authenticated, or show a message
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return (
        <div className="container mx-auto px-4 py-12 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
            <p>Please log in to view your profile.</p>
            <Button onClick={() => router.push('/auth/login')} className="mt-4">Login</Button>
        </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U'; // Safety check for undefined/empty name
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };
  
  const avatarUrl = user.user_avatar ? mediaService.getMediaUrl(user.user_avatar) : undefined;


  return (
    <div className="bg-slate-50 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto shadow-lg">
          <CardHeader className="bg-slate-100 p-6 rounded-t-lg">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-md">
                {avatarUrl ? (
                    <NextImage src={avatarUrl} alt={user.user_fullName || 'User Avatar'} layout="fill" objectFit="cover" />
                ) : (
                    <AvatarFallback className="text-3xl bg-blue-500 text-white">
                        {getInitials(user.user_fullName || 'U')}
                    </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-800">
                  {user.user_fullName}
                </CardTitle>
                {user.user_email && (
                  <CardDescription className="text-sm text-slate-600 mt-1 flex items-center justify-center sm:justify-start">
                    <Mail className="w-4 h-4 mr-1.5" />
                    {user.user_email}
                  </CardDescription>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-2 sm:mt-0 sm:ml-auto">
                <Edit3 className="w-4 h-4 mr-1.5" /> Edit Profile
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Account Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/orders" passHref>
                  <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    <div>
                        <h3 className="font-medium text-slate-800">My Orders</h3>
                        <p className="text-xs text-slate-500">View your order history</p>
                    </div>
                  </div>
                </Link>
                <Link href="/wishlist" passHref>
                  <div className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                     <div>
                        <h3 className="font-medium text-slate-800">My Wishlist</h3>
                        <p className="text-xs text-slate-500">Manage your saved items</p>
                    </div>
                  </div>
                </Link>
                 {/* Add more links as needed, e.g., for addresses, payment methods */}
                 <Link href="/profile/addresses" passHref>
                  <div className="p-4 bg-green-50 hover:bg-green-100 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-green-600" />
                     <div>
                        <h3 className="font-medium text-slate-800">My Addresses</h3>
                        <p className="text-xs text-slate-500">Manage your shipping addresses</p>
                    </div>
                  </div>
                </Link>
                 <Link href="/profile/security" passHref>
                  <div className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-3">
                    <Shield className="w-6 h-6 text-yellow-600" />
                     <div>
                        <h3 className="font-medium text-slate-800">Login & Security</h3>
                        <p className="text-xs text-slate-500">Change password, 2FA</p>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
            
            <Separator className="my-6" />

            <section>
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Personal Information</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Full Name:</span>
                        <span className="text-slate-700 font-medium">{user.user_fullName || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Email:</span>
                        <span className="text-slate-700 font-medium">{user.user_email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Phone Number:</span>
                        <span className="text-slate-700 font-medium">{user.phoneNumber || '-'}</span>
                    </div>
                    {/* Add more user details as available and relevant */}
                </div>
            </section>

            <Separator className="my-6" />

            <div className="mt-8 text-center">
              <Button variant="destructive" onClick={handleLogout} size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;

