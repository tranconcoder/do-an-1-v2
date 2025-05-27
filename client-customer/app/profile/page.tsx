'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { User, Shop, loginSuccess } from '@/lib/store/slices/userSlice';
import userService, { UpdateProfilePayload } from '@/lib/services/api/userService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user: currentUser, isLoading: isAuthLoading, isAuthenticated, accessToken } = useSelector((state: RootState) => state.user);

  const [user, setUser] = useState<User | null>(currentUser);
  const [shop, setShop] = useState<Shop | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateProfilePayload>({
    user_fullName: '',
    user_email: '',
    phoneNumber: '',
    user_sex: undefined,
    user_dayOfBirth: '',
    user_avatar: '',
  });
  const [date, setDate] = useState<Date | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && currentUser) {
      setUser(currentUser);
      setFormData({
        user_fullName: currentUser.user_fullName || '',
        user_email: currentUser.user_email || '',
        phoneNumber: currentUser.phoneNumber || '',
        user_sex: currentUser.user_sex,
        user_dayOfBirth: currentUser.user_dayOfBirth || '',
        user_avatar: currentUser.user_avatar || '',
      });
      if (currentUser.user_dayOfBirth) {
        setDate(new Date(currentUser.user_dayOfBirth));
      }
      setError(null);
    } else if (!isAuthLoading && !isAuthenticated && !accessToken) {
      // If auth check is done, not authenticated, and no accessToken (e.g. after logout or initial load with no tokens)
      // Redirect or show login message. For now, ProfilePage assumes it's protected.
      // Potentially, set an error or redirect here if this page should strictly be for authenticated users.
      // setError('Bạn cần đăng nhập để xem trang này.');
    }

    // This condition fetches profile data if StoreProvider is done with auth check (`!isAuthLoading`),
    // but somehow `currentUser` from Redux is still null, *and* there is an `accessToken`.
    // This might happen if a user lands directly on this page and `StoreProvider` successfully gets tokens
    // but the profile fetch in `StoreProvider` is still pending or failed silently without clearing tokens.
    // Or, if `StoreProvider` logic is changed and it doesn't set `currentUser` immediately after token validation.
    if (!isAuthLoading && !currentUser && accessToken) {
      const fetchProfileOnLoad = async () => {
        try {
          const profileData = await userService.getProfile();
          setUser(profileData.user);
          setShop(profileData.shop || null);
          setFormData({
            user_fullName: profileData.user.user_fullName || '',
            user_email: profileData.user.user_email || '',
            phoneNumber: profileData.user.phoneNumber || '',
            user_sex: profileData.user.user_sex,
            user_dayOfBirth: profileData.user.user_dayOfBirth || '',
            user_avatar: profileData.user.user_avatar || '',
          });
          if (profileData.user.user_dayOfBirth) {
            setDate(new Date(profileData.user.user_dayOfBirth));
          }
          setError(null);
          // Dispatch to sync Redux if StoreProvider missed it
          dispatch(loginSuccess({ 
            user: profileData.user, 
            shop: profileData.shop || undefined, 
            token: { accessToken: accessToken, refreshToken: localStorage.getItem('refreshToken') || ''}
          }));
        } catch (err: any) {
          console.error('Failed to fetch profile initially on page:', err);
          setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
          setUser(null);
          setShop(null);
        }
      };
      fetchProfileOnLoad();
    }

  }, [isAuthLoading, isAuthenticated, currentUser, accessToken, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'user_sex') {
      let sexValue: boolean | undefined;
      if (value === 'true') {
        sexValue = true;
      } else if (value === 'false') {
        sexValue = false;
      } else {
        sexValue = undefined;
      }
      setFormData(prev => ({
        ...prev,
        user_sex: sexValue,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        user_dayOfBirth: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updatedProfileData = await userService.updateProfile(formData);
      
      // Update local state
      setUser(updatedProfileData.user);
      if (updatedProfileData.shop) {
        setShop(updatedProfileData.shop);
      }

      // Update Redux store
      // Assuming the API response for update doesn't include tokens directly,
      // we retrieve the current tokens from localStorage or Redux state to keep the user logged in.
      // If your updateProfile API *does* return new tokens, use those instead.
      const currentAccessToken = localStorage.getItem('accessToken');
      const currentRefreshToken = localStorage.getItem('refreshToken');

      if (currentAccessToken && currentRefreshToken) {
        dispatch(loginSuccess({
          user: updatedProfileData.user,
          shop: updatedProfileData.shop || undefined,
          token: {
            accessToken: currentAccessToken, // Use existing token
            refreshToken: currentRefreshToken, // Use existing token
          }
        }));
      } else {
        // Handle case where tokens might be missing - though unlikely if user is on this page
        console.warn("Tokens not found for Redux update after profile change.");
      }
      
      setIsUpdating(false);
      setIsEditing(false); // Exit editing mode
      alert('Cập nhật thông tin thành công!');

    } catch (error) {
      console.error('Error updating profile:', error);
      setIsUpdating(false);
      alert('Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };
  
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl">
            <CardHeader className="p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-t-xl">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Skeleton className="h-28 w-28 rounded-full border-4 border-white" />
                <div className="space-y-2 flex-1 w-full sm:w-auto">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-5 w-2/3" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-1/3 mt-4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-1/3 mt-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
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
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>Không tìm thấy hồ sơ người dùng.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <Card className="w-full max-w-2xl mx-auto shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-28 w-28 border-4 border-white shadow-md">
                <AvatarImage src={formData.user_avatar || user.user_avatar} alt={`${formData.user_fullName}'s avatar`} />
                <AvatarFallback className="text-4xl bg-blue-500 text-white">
                  {getInitials(formData.user_fullName || user.user_fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left flex-1">
                <CardTitle className="text-3xl font-bold text-blue-900">{isEditing ? formData.user_fullName : user.user_fullName}</CardTitle>
                <CardDescription className="text-blue-700/80 mt-1">{isEditing ? formData.user_email : user.user_email}</CardDescription>
                <p className="text-sm text-blue-600/70 mt-1">{isEditing ? formData.phoneNumber : user.phoneNumber}</p>
                {!isEditing && user.user_sex !== undefined && (
                  <p className="text-sm text-blue-600/70 mt-1">
                    Giới tính: {user.user_sex ? 'Nam' : 'Nữ'}
                  </p>
                )}
              </div>
              {!isEditing && (
                 <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="border-blue-200 text-blue-600 hover:bg-blue-50">
                   <Edit3 className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="user_fullName" className="text-blue-800">Họ và tên</Label>
                  <Input 
                    id="user_fullName"
                    name="user_fullName"
                    value={formData.user_fullName}
                    onChange={handleInputChange}
                    className="bg-white/80 border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="user_email" className="text-blue-800">Email</Label>
                  <Input 
                    id="user_email"
                    name="user_email"
                    type="email"
                    value={formData.user_email}
                    onChange={handleInputChange}
                    className="bg-white/80 border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-blue-800">Số điện thoại</Label>
                  <Input 
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="bg-white/80 border-blue-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="user_sex" className="text-blue-800">Giới tính</Label>
                    <Select
                      name="user_sex"
                      value={formData.user_sex === true ? 'true' : (formData.user_sex === false ? 'false' : '')}
                      onValueChange={(value) => handleSelectChange('user_sex', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Chưa cập nhật</SelectItem>
                        <SelectItem value="true">Nam</SelectItem>
                        <SelectItem value="false">Nữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-800">Ngày sinh</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/80 border-blue-100 hover:bg-blue-50 focus:border-blue-500 focus:ring-blue-500",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày sinh</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={handleDateChange}
                          initialFocus
                          captionLayout="dropdown-buttons"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="text-blue-600 hover:bg-blue-50">
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isUpdating} 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                     <div>
                    <Label className="text-sm font-medium text-blue-600/80">Họ và tên</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.user_fullName}</p>
                    </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-600/80">Email</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.user_email}</p>
                  </div>
                     <div>
                    <Label className="text-sm font-medium text-blue-600/80">Số điện thoại</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.phoneNumber}</p>
                  </div>
                     <div>
                    <Label className="text-sm font-medium text-blue-600/80">Giới tính</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.user_sex === '1' ? 'Nam' : (user.user_sex === '0' ? 'Nữ' : 'Chưa cập nhật')}</p>
                    </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-600/80">Ngày sinh</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.user_dayOfBirth ? format(new Date(user.user_dayOfBirth), "dd/MM/yyyy") : 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-600/80">Vai trò</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.role_name === 'user' ? 'Người dùng' : user.role_name}</p>
              </div>
                  <div>
                    <Label className="text-sm font-medium text-blue-600/80">Trạng thái</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{user.user_status === 'ACTIVE' ? 'Đang hoạt động' : user.user_status}</p>
                    </div>
                </div>

                {shop && (
                  <div className="pt-4 border-t border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-800 mb-3">Thông tin cửa hàng</h3>
                    <Label className="text-sm font-medium text-blue-600/80">Tên cửa hàng</Label>
                    <p className="text-lg text-blue-900/90 mt-1">{shop.shop_name}</p>
                    {/* Add more shop details here, e.g., shop type, status */}
                  </div>
                )}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

