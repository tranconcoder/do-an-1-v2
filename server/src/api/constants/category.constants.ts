import mongoose from 'mongoose';

export const categories: Array<model.category.Category> = [
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000000'),
        category_name: 'Điện tử',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000000'),
        category_description: 'Mô tả điện tử'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000001'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000000'),
        category_name: 'Điện thoại',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000001'),
        category_description: 'Mô tả điện thoại'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000002'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000000'),
        category_name: 'Laptop',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000002'),
        category_description: 'Mô tả laptop'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000003'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000000'),
        category_name: 'Phụ kiện',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000003'),
        category_description: 'Mô tả phụ kiện'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000004'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000000'),
        category_name: 'Máy tính bảng',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000004'),
        category_description: 'Mô tả máy tính bảng'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000005'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000003'),
        category_name: 'Sạc',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000005'),
        category_description: 'Mô tả sạc'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000006'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000003'),
        category_name: 'Cáp',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000006'),
        category_description: 'Mô tả caps'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000007'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000003'),
        category_name: 'Tai nghe',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000007'),
        category_description: 'Mô tả tai nghe'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000008'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000003'),
        category_name: 'Bàn phím',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000008'),
        category_description: 'Mô tả bàn phím'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000009'),
        category_name: 'Đồ gia dụng',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000009'),
        category_description: 'Mô tả đồ gia dụng'
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000a'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000009'),
        category_name: 'Tivi',
        category_icon: new mongoose.Types.ObjectId('00000000000000000000000a'),
        category_description: 'Mô tả tivi'
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000b'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000009'),
        category_name: 'Tủ lạnh',
        category_icon: new mongoose.Types.ObjectId('00000000000000000000000b'),
        category_description: 'Mô tả tủ lạnh'
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000c'),
        category_parent: new mongoose.Types.ObjectId('000000000000000000000009'),
        category_name: 'Máy lạnh',
        category_icon: new mongoose.Types.ObjectId('00000000000000000000000c'),
        category_description: 'Mô tả máy lạnh'
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000d'),
        category_name: 'Đồ nội thất',
        category_icon: new mongoose.Types.ObjectId('00000000000000000000000d'),
        category_description: 'Mô tả đồ nội thất'
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000e'),
        category_parent: new mongoose.Types.ObjectId('00000000000000000000000d'),
        category_name: 'Ghế',
        category_icon: new mongoose.Types.ObjectId('00000000000000000000000e'),
        category_description: 'Mô tả ghế'
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000f'),
        category_parent: new mongoose.Types.ObjectId('00000000000000000000000d'),
        category_name: 'Bàn',
        category_icon: new mongoose.Types.ObjectId('00000000000000000000000f'),
        category_description: 'Mô tả bàn'
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000010'),
        category_parent: new mongoose.Types.ObjectId('00000000000000000000000d'),
        category_name: 'Sofa',
        category_icon: new mongoose.Types.ObjectId('000000000000000000000010'),
        category_description: 'Mô tả sofa'
    }
];
