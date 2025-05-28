'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, Save, X } from 'lucide-react';
import userService, { UserProfile, UpdateProfilePayload } from '@/lib/services/api/userService';
import { getMediaUrl } from '@/lib/services/api/mediaService';

export default function ProfilePage() {
    const router = useRouter();
    const { toast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        user_fullName: '',
        user_email: '',
        user_sex: false,
        user_dayOfBirth: '',
        user_avatar: ''
    });

    // Fetch user profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();
            const userProfile = response.metadata.user;
            setProfile(userProfile);

            // Initialize form data with current profile data
            setFormData({
                user_fullName: userProfile.user_fullName || '',
                user_email: userProfile.user_email || '',
                user_sex: userProfile.user_sex || false,
                user_dayOfBirth: userProfile.user_dayOfBirth || '',
                user_avatar: userProfile.user_avatar || ''
            });
        } catch (error: any) {
            console.error('Failed to fetch profile:', error);

            // Check if user is not authenticated
            if (error.response?.status === 401) {
                toast({
                    title: 'Yêu cầu xác thực',
                    description: 'Vui lòng đăng nhập để xem hồ sơ của bạn.',
                    variant: 'destructive'
                });
                router.push('/auth/login');
                return;
            }

            toast({
                title: 'Lỗi',
                description: 'Tải hồ sơ thất bại. Vui lòng thử lại.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

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
            if (formData.user_avatar !== profile.user_avatar) {
                updatePayload.user_avatar = formData.user_avatar;
            }

            // Only update if there are changes
            if (Object.keys(updatePayload).length === 0) {
                toast({
                    title: 'Không có thay đổi',
                    description: 'Không có thay đổi nào được thực hiện đối với hồ sơ của bạn.'
                });
                setEditing(false);
                return;
            }

            const response = await userService.updateProfile(updatePayload);
            setProfile(response.metadata);
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

        // Reset form data to original values
        setFormData({
            user_fullName: profile.user_fullName || '',
            user_email: profile.user_email || '',
            user_sex: profile.user_sex || false,
            user_dayOfBirth: profile.user_dayOfBirth || '',
            user_avatar: profile.user_avatar || ''
        });
        setEditing(false);
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Đang tải hồ sơ...</span>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-muted-foreground">Tải hồ sơ thất bại</p>
                            <Button onClick={fetchProfile} className="mt-4" variant="outline">
                                Thử lại
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage
                                    src={
                                        profile.user_avatar
                                            ? getMediaUrl(profile.user_avatar)
                                            : undefined
                                    }
                                    alt={profile.user_fullName}
                                />
                                <AvatarFallback className="text-lg">
                                    {getInitials(profile.user_fullName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-2xl">Hồ sơ của tôi</CardTitle>
                        <CardDescription>
                            Quản lý thông tin cá nhân và tùy chọn của bạn
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Họ và tên</Label>
                                {editing ? (
                                    <Input
                                        id="fullName"
                                        value={formData.user_fullName}
                                        onChange={(e) =>
                                            handleInputChange('user_fullName', e.target.value)
                                        }
                                        placeholder="Nhập họ và tên đầy đủ của bạn"
                                        required
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        {profile.user_fullName}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Địa chỉ email</Label>
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
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        {profile.user_email}
                                    </div>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Số điện thoại</Label>
                                <div className="p-3 bg-gray-100 rounded-md text-gray-600">
                                    {profile.phoneNumber}
                                    <span className="text-sm text-gray-500 ml-2">
                                        (Không thể thay đổi)
                                    </span>
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
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn giới tính" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Nam</SelectItem>
                                            <SelectItem value="female">Nữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        {profile.user_sex ? 'Nam' : 'Nữ'}
                                    </div>
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-2">
                                <Label htmlFor="dob">Ngày sinh</Label>
                                {editing ? (
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formatDate(formData.user_dayOfBirth)}
                                        onChange={(e) =>
                                            handleInputChange('user_dayOfBirth', e.target.value)
                                        }
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        {profile.user_dayOfBirth
                                            ? new Date(profile.user_dayOfBirth).toLocaleDateString()
                                            : 'Chưa cung cấp'}
                                    </div>
                                )}
                            </div>

                            {/* User Status */}
                            <div className="space-y-2">
                                <Label>Trạng thái tài khoản</Label>
                                <div className="p-3 bg-gray-100 rounded-md">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            profile.user_status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {profile.user_status}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-6">
                                {editing ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            disabled={updating}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Hủy
                                        </Button>
                                        <Button type="submit" disabled={updating}>
                                            {updating ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="button" onClick={() => setEditing(true)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Chỉnh sửa hồ sơ
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
