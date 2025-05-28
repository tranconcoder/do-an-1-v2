'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
    Loader2, 
    Edit, 
    Save, 
    X, 
    Camera, 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    Shield,
    Upload,
    ImageIcon
} from 'lucide-react';
import userService, { UserProfile, UpdateProfilePayload } from '@/lib/services/api/userService';
import { getMediaUrl } from '@/lib/services/api/mediaService';
import ImageCropper from '@/components/ui/image-cropper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '@/lib/store/slices/userSlice';
import type { AppDispatch, RootState } from '@/lib/store/store';
import AddressManager from '@/components/profile/AddressManager';

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();

    // Select user data from Redux store
    const user = useSelector((state: RootState) => state.user.user);
    const isLoadingUser = useSelector((state: RootState) => state.user.isLoading);
    const userError = useSelector((state: RootState) => state.user.error);

    // Hydration fix - track if component has mounted
    const [hasMounted, setHasMounted] = useState(false);

    // Local state, initialized from Redux user data
    const [profile, setProfile] = useState<UserProfile | null>(user);
    const [editing, setEditing] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Image cropper state
    const [showImageCropper, setShowImageCropper] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState('');
    const [selectedFileName, setSelectedFileName] = useState('');

    // File input ref for avatar upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state, initialized from Redux user data
    const [formData, setFormData] = useState({
        user_fullName: user?.user_fullName || '',
        user_email: user?.user_email || '',
        user_sex: user?.user_sex || false,
        user_dayOfBirth: user?.user_dayOfBirth || '',
        user_avatar: user?.user_avatar || ''
    });

    // Handle hydration
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Fetch user profile on component mount if not already in Redux store
    useEffect(() => {
        if (hasMounted && !user) {
            dispatch(fetchUser());
        }
    }, [hasMounted, user, dispatch]);

    // Update local state when Redux user data changes
    useEffect(() => {
        setProfile(user);
        setFormData({
            user_fullName: user?.user_fullName || '',
            user_email: user?.user_email || '',
            user_sex: user?.user_sex || false,
            user_dayOfBirth: user?.user_dayOfBirth || '',
            user_avatar: user?.user_avatar || ''
        });
    }, [user]);

    const handleInputChange = (field: keyof UpdateProfilePayload, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profile) return;

        try {
            setUpdating(true);

            // Create update payload with only changed fields
            const updatePayload: UpdateProfilePayload = {};

            if (formData.user_fullName !== profile.user_fullName) {
                updatePayload.user_fullName = formData.user_fullName;
            }
            if (formData.user_email !== profile.user_email) {
                updatePayload.user_email = formData.user_email;
            }
            if (formData.user_sex !== profile.user_sex) {
                updatePayload.user_sex = formData.user_sex;
            }
            if (formData.user_dayOfBirth !== profile.user_dayOfBirth) {
                updatePayload.user_dayOfBirth = formData.user_dayOfBirth;
            }
            // user_avatar is handled by the separate upload functionality

            // Only update if there are changes
            if (Object.keys(updatePayload).length === 0) {
                toast({
                    title: 'Không có thay đổi',
                    description: 'Không có thay đổi nào được thực hiện đối với hồ sơ của bạn.'
                });
                setEditing(false);
                return;
            }

            await userService.updateProfile(updatePayload);
            
            // Fetch updated user profile to keep Redux state in sync
            dispatch(fetchUser());

            setEditing(false);

            toast({
                title: 'Thành công',
                description: 'Cập nhật hồ sơ thành công!'
            });
        } catch (error: any) {
            console.error('Failed to update profile:', error);

            const errorMessage =
                error.response?.data?.message || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.';
            toast({
                title: 'Cập nhật thất bại',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        if (!profile) return;

        // Reset form data to current profile values from state
        setFormData({
            user_fullName: profile.user_fullName || '',
            user_email: profile.user_email || '',
            user_sex: profile.user_sex || false,
            user_dayOfBirth: profile.user_dayOfBirth || '',
            user_avatar: profile.user_avatar || ''
        });
        setEditing(false);
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Lỗi định dạng file',
                description: 'Vui lòng chọn file ảnh có định dạng JPG, PNG hoặc GIF.',
                variant: 'destructive'
            });
            return;
        }

        // Validate file size (10MB max for initial selection)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast({
                title: 'File quá lớn',
                description: 'Kích thước file không được vượt quá 10MB.',
                variant: 'destructive'
            });
            return;
        }

        // Create preview URL and show cropper
        const url = URL.createObjectURL(file);
        setSelectedImageSrc(url);
        setSelectedFileName(file.name);
        setShowImageCropper(true);
    };

    const handleCropComplete = async (croppedImageDataUrl: string) => {
        try {
            setUploadingAvatar(true);
            
            // Convert data URL to File
            const response = await fetch(croppedImageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], selectedFileName || 'avatar.jpg', { type: 'image/jpeg' });
            
            await userService.uploadAvatar(file);
            
            // Fetch updated user profile to keep Redux state in sync
            dispatch(fetchUser());

            toast({
                title: 'Thành công',
                description: 'Cập nhật ảnh đại diện thành công!'
            });
        } catch (error: any) {
            console.error('Failed to upload avatar:', error);
            const errorMessage = error.response?.data?.message || 'Tải ảnh đại diện thất bại. Vui lòng thử lại.';
            toast({
                title: 'Tải ảnh thất bại',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setUploadingAvatar(false);
            // Clean up
            if (selectedImageSrc) {
                URL.revokeObjectURL(selectedImageSrc);
            }
            setSelectedImageSrc('');
            setSelectedFileName('');
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleCropperClose = () => {
        setShowImageCropper(false);
        // Clean up
        if (selectedImageSrc) {
            URL.revokeObjectURL(selectedImageSrc);
        }
        setSelectedImageSrc('');
        setSelectedFileName('');
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Use isLoadingUser and userError from Redux for loading and error states
    if (!hasMounted || isLoadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <p className="text-gray-600 font-medium">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (userError || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Card className="w-full max-w-md shadow-xl">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <X className="w-8 h-8 text-red-600" />
                            </div>
                            <p className="text-gray-600">{userError || 'Tải hồ sơ thất bại'}</p>
                            <Button onClick={() => dispatch(fetchUser())} variant="outline" className="w-full">
                                Thử lại
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Use user data from Redux store
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                            <p className="text-gray-600 mt-1">Quản lý thông tin và cài đặt tài khoản của bạn</p>
                        </div>
                        <Badge 
                            variant={user.user_status === 'active' ? 'default' : 'destructive'}
                            className="px-3 py-1"
                        >
                            <Shield className="w-3 h-3 mr-1" />
                            {user.user_status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Avatar Section */}
                    <div className="lg:col-span-1">
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="text-center space-y-4">
                                    <div className="relative inline-block">
                                        <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                                            <AvatarImage
                                                src={
                                                    user.user_avatar
                                                        ? getMediaUrl(user.user_avatar)
                                                        : undefined
                                                }
                                                alt={user.user_fullName}
                                                className="object-cover"
                                            />
                                            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                {getInitials(user.user_fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Upload Button */}
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full p-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            onClick={triggerFileInput}
                                            disabled={uploadingAvatar}
                                        >
                                            {uploadingAvatar ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Camera className="h-4 w-4" />
                                            )}
                                        </Button>
                                        
                                        {/* Hidden file input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif"
                                            onChange={handleImageSelect}
                                            className="hidden"
                                        />
                                    </div>
                                    
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {user.user_fullName}
                                        </h2>
                                        <p className="text-gray-600">{user.user_email}</p>
                                    </div>

                                    <div className="pt-4 border-t space-y-2">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            {user.phoneNumber}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            {user.user_dayOfBirth
                                                ? new Date(user.user_dayOfBirth).toLocaleDateString('vi-VN')
                                                : 'Chưa cung cấp'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <User className="h-5 w-5" />
                                            Thông tin cá nhân
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Cập nhật thông tin cá nhân và tùy chọn của bạn
                                        </CardDescription>
                                    </div>
                                    {!editing && user && (
                                        <Button 
                                            onClick={() => setEditing(true)}
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Chỉnh sửa
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            Họ và tên
                                        </Label>
                                        {editing ? (
                                            <Input
                                                id="fullName"
                                                value={formData.user_fullName}
                                                onChange={(e) =>
                                                    handleInputChange('user_fullName', e.target.value)
                                                }
                                                placeholder="Nhập họ và tên đầy đủ của bạn"
                                                required
                                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg border">
                                                {user?.user_fullName}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            Địa chỉ email
                                        </Label>
                                        {editing ? (
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.user_email}
                                                onChange={(e) =>
                                                    handleInputChange('user_email', e.target.value)
                                                }
                                                placeholder="Nhập địa chỉ email của bạn"
                                                required
                                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg border">
                                                {user?.user_email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            Số điện thoại
                                        </Label>
                                        <div className="p-3 bg-gray-100 rounded-lg border text-gray-600 flex items-center justify-between">
                                            <span>{user?.phoneNumber}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                Không thể thay đổi
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label htmlFor="gender">Giới tính</Label>
                                        {editing ? (
                                            <Select
                                                value={formData.user_sex ? 'male' : 'female'}
                                                onValueChange={(value) =>
                                                    handleInputChange('user_sex', value === 'male')
                                                }
                                            >
                                                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                                    <SelectValue placeholder="Chọn giới tính" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">Nam</SelectItem>
                                                    <SelectItem value="female">Nữ</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg border">
                                                {user?.user_sex ? 'Nam' : 'Nữ'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date of Birth */}
                                    <div className="space-y-2">
                                        <Label htmlFor="dob" className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Ngày sinh
                                        </Label>
                                        {editing ? (
                                            <Input
                                                id="dob"
                                                type="date"
                                                value={formatDate(formData.user_dayOfBirth)}
                                                onChange={(e) =>
                                                    handleInputChange('user_dayOfBirth', e.target.value)
                                                }
                                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg border">
                                                {user?.user_dayOfBirth
                                                    ? new Date(user.user_dayOfBirth).toLocaleDateString('vi-VN')
                                                    : 'Chưa cung cấp'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    {editing && (
                                        <div className="flex justify-end space-x-3 pt-6 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={updating}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Hủy
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                disabled={updating}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                            >
                                                {updating ? (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4 mr-2" />
                                                )}
                                                {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Address Management Section */}
                <div className="mt-8">
                    <AddressManager />
                </div>
            </div>

            {/* Image Cropper Modal */}
            <ImageCropper
                open={showImageCropper}
                onClose={handleCropperClose}
                imageSrc={selectedImageSrc}
                onCropComplete={handleCropComplete}
                aspectRatio={1}
                cropShape="round"
                fileName={selectedFileName}
            />
        </div>
    );
}
