'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    MapPin,
    Edit,
    Trash2,
    Star,
    StarOff,
    Loader2,
    Home,
    Building,
    User
} from 'lucide-react';
import { Address, CreateAddressPayload, UpdateAddressPayload } from '@/lib/services/api/addressService';
import locationService, { Province, District, Ward } from '@/lib/services/api/locationService';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/lib/store/store';
import {
    fetchUserAddresses,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
    clearError
} from '@/lib/store/slices/addressSlice';

interface AddressFormData {
    recipient_name: string;
    recipient_phone: string;
    province: string;
    district: string;
    ward: string;
    address: string;
    address_label: string;
    is_default: boolean;
}

const initialFormData: AddressFormData = {
    recipient_name: '',
    recipient_phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    address_label: '',
    is_default: false
};

export default function AddressManager() {
    const { toast } = useToast();
    const dispatch = useDispatch<AppDispatch>();
    
    // Redux state
    const { 
        addresses, 
        isLoading, 
        isCreating, 
        isUpdating, 
        isDeleting, 
        error 
    } = useSelector((state: RootState) => state.address);
    
    // Local state for form and UI
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<AddressFormData>(initialFormData);
    
    // Location data
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Load addresses on mount
    useEffect(() => {
        dispatch(fetchUserAddresses());
        loadProvinces();
    }, [dispatch]);

    // Handle Redux errors
    useEffect(() => {
        if (error) {
            toast({
                title: 'Lỗi',
                description: error,
                variant: 'destructive'
            });
            dispatch(clearError());
        }
    }, [error, toast, dispatch]);

    // Load districts when province changes
    useEffect(() => {
        if (formData.province) {
            loadDistricts(formData.province);
            setFormData(prev => ({ ...prev, district: '', ward: '' }));
        }
    }, [formData.province]);

    // Load wards when district changes
    useEffect(() => {
        if (formData.district) {
            loadWards(formData.district);
            setFormData(prev => ({ ...prev, ward: '' }));
        }
    }, [formData.district]);

    const loadProvinces = async () => {
        try {
            setLoadingProvinces(true);
            const data = await locationService.getProvinces();
            setProvinces(data);
        } catch (error) {
            console.error('Failed to load provinces:', error);
        } finally {
            setLoadingProvinces(false);
        }
    };

    const loadDistricts = async (provinceId: string) => {
        try {
            setLoadingDistricts(true);
            const data = await locationService.getDistricts(provinceId);
            setDistricts(data);
        } catch (error) {
            console.error('Failed to load districts:', error);
        } finally {
            setLoadingDistricts(false);
        }
    };

    const loadWards = async (districtId: string) => {
        try {
            setLoadingWards(true);
            const data = await locationService.getWards(districtId);
            setWards(data);
        } catch (error) {
            console.error('Failed to load wards:', error);
        } finally {
            setLoadingWards(false);
        }
    };

    const handleInputChange = (field: keyof AddressFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingAddress(null);
        setDistricts([]);
        setWards([]);
    };

    const openAddDialog = () => {
        resetForm();
        setShowAddDialog(true);
    };

    const openEditDialog = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            recipient_name: address.recipient_name,
            recipient_phone: address.recipient_phone,
            province: address.location.province._id,
            district: address.location.district._id,
            ward: address.location.ward?._id || '',
            address: address.location.address,
            address_label: address.address_label || '',
            is_default: address.is_default
        });
        setShowAddDialog(true);
    };

    const closeDialog = () => {
        setShowAddDialog(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Create location first
            const locationPayload = {
                provinceId: formData.province,
                districtId: formData.district,
                wardId: formData.ward || undefined,
                address: formData.address
            };

            const location = await locationService.createLocation(locationPayload);

            const addressPayload: CreateAddressPayload | UpdateAddressPayload = {
                recipient_name: formData.recipient_name,
                recipient_phone: formData.recipient_phone,
                location: location._id,
                address_label: formData.address_label || undefined,
                is_default: formData.is_default
            };

            if (editingAddress) {
                await dispatch(updateAddress({ 
                    addressId: editingAddress._id, 
                    payload: addressPayload 
                })).unwrap();
                toast({
                    title: 'Thành công',
                    description: 'Cập nhật địa chỉ thành công!'
                });
            } else {
                await dispatch(createAddress(addressPayload as CreateAddressPayload)).unwrap();
                toast({
                    title: 'Thành công',
                    description: 'Thêm địa chỉ mới thành công!'
                });
            }

            closeDialog();
        } catch (error: any) {
            console.error('Failed to save address:', error);
            toast({
                title: 'Lỗi',
                description: error || 'Không thể lưu địa chỉ',
                variant: 'destructive'
            });
        }
    };

    const handleSetDefault = async (addressId: string) => {
        try {
            await dispatch(setDefaultAddress(addressId)).unwrap();
            toast({
                title: 'Thành công',
                description: 'Đã đặt làm địa chỉ mặc định!'
            });
        } catch (error: any) {
            console.error('Failed to set default address:', error);
            toast({
                title: 'Lỗi',
                description: error || 'Không thể đặt làm địa chỉ mặc định',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async (addressId: string) => {
        try {
            await dispatch(deleteAddress(addressId)).unwrap();
            toast({
                title: 'Thành công',
                description: 'Xóa địa chỉ thành công!'
            });
        } catch (error: any) {
            console.error('Failed to delete address:', error);
            toast({
                title: 'Lỗi',
                description: error || 'Không thể xóa địa chỉ',
                variant: 'destructive'
            });
        }
    };

    const getAddressIcon = (label?: string) => {
        switch (label?.toLowerCase()) {
            case 'home':
            case 'nhà':
                return <Home className="w-4 h-4" />;
            case 'office':
            case 'văn phòng':
                return <Building className="w-4 h-4" />;
            default:
                return <MapPin className="w-4 h-4" />;
        }
    };

    const formatFullAddress = (address: Address) => {
        const parts = [
            address.location.address,
            address.location.ward?.ward_name,
            address.location.district.district_name,
            address.location.province.province_name
        ].filter(Boolean);
        
        return parts.join(', ');
    };

    if (isLoading) {
        return (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Đang tải địa chỉ...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <MapPin className="h-5 w-5" />
                            Địa chỉ giao hàng
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Quản lý địa chỉ giao hàng của bạn
                        </CardDescription>
                    </div>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button 
                                onClick={openAddDialog}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm địa chỉ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingAddress 
                                        ? 'Cập nhật thông tin địa chỉ giao hàng'
                                        : 'Thêm địa chỉ giao hàng mới cho tài khoản của bạn'
                                    }
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Recipient Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_name">Tên người nhận *</Label>
                                        <Input
                                            id="recipient_name"
                                            value={formData.recipient_name}
                                            onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                                            placeholder="Nhập tên người nhận"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_phone">Số điện thoại *</Label>
                                        <Input
                                            id="recipient_phone"
                                            value={formData.recipient_phone}
                                            onChange={(e) => handleInputChange('recipient_phone', e.target.value)}
                                            placeholder="Nhập số điện thoại"
                                            pattern="[0-9]{10}"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                                        <Select
                                            value={formData.province}
                                            onValueChange={(value) => handleInputChange('province', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingProvinces ? (
                                                    <SelectItem value="loading" disabled>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        Đang tải...
                                                    </SelectItem>
                                                ) : (
                                                    provinces.map((province) => (
                                                        <SelectItem key={province._id} value={province._id}>
                                                            {province.province_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district">Quận/Huyện *</Label>
                                        <Select
                                            value={formData.district}
                                            onValueChange={(value) => handleInputChange('district', value)}
                                            disabled={!formData.province}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn quận/huyện" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingDistricts ? (
                                                    <SelectItem value="loading" disabled>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        Đang tải...
                                                    </SelectItem>
                                                ) : (
                                                    districts.map((district) => (
                                                        <SelectItem key={district._id} value={district._id}>
                                                            {district.district_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ward">Phường/Xã</Label>
                                        <Select
                                            value={formData.ward}
                                            onValueChange={(value) => handleInputChange('ward', value)}
                                            disabled={!formData.district}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phường/xã" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loadingWards ? (
                                                    <SelectItem value="loading" disabled>
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        Đang tải...
                                                    </SelectItem>
                                                ) : (
                                                    wards.map((ward) => (
                                                        <SelectItem key={ward._id} value={ward._id}>
                                                            {ward.ward_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Số nhà, tên đường..."
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address_label">Nhãn địa chỉ</Label>
                                    <Select
                                        value={formData.address_label}
                                        onValueChange={(value) => handleInputChange('address_label', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại địa chỉ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Nhà">Nhà</SelectItem>
                                            <SelectItem value="Văn phòng">Văn phòng</SelectItem>
                                            <SelectItem value="Khác">Khác</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={formData.is_default}
                                        onChange={(e) => handleInputChange('is_default', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="is_default">Đặt làm địa chỉ mặc định</Label>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeDialog}>
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={isCreating || isUpdating}>
                                        {isCreating || isUpdating ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : null}
                                        {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {addresses.length === 0 ? (
                    <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ giao hàng nào</p>
                        <Button onClick={openAddDialog} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm địa chỉ đầu tiên
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className={`p-4 rounded-lg border-2 transition-colors ${
                                    address.is_default
                                        ? 'border-blue-200 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getAddressIcon(address.address_label)}
                                            <span className="font-medium">{address.recipient_name}</span>
                                            <span className="text-gray-600">|</span>
                                            <span className="text-gray-600">{address.recipient_phone}</span>
                                            {address.is_default && (
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Mặc định
                                                </Badge>
                                            )}
                                            {address.address_label && (
                                                <Badge variant="secondary">
                                                    {address.address_label}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-gray-700 text-sm">
                                            {formatFullAddress(address)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {!address.is_default && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSetDefault(address._id)}
                                                className="text-xs"
                                            >
                                                <StarOff className="w-3 h-3 mr-1" />
                                                Đặt mặc định
                                            </Button>
                                        )}
                                        
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditDialog(address)}
                                        >
                                            <Edit className="w-3 h-3" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Xóa địa chỉ</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bạn có chắc chắn muốn xóa địa chỉ này? Hành động này không thể hoàn tác.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(address._id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Xóa
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 