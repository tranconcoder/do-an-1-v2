import {
    AVATAR_BASE_PATH,
    CATEGORY_BASE_PATH,
    CATEGORY_INIT_BASE_PATH,
    SPU_BASE_PATH
} from '@/configs/media.config.js';
import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { getRandomFilename } from '@/utils/multer.util.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import multer from 'multer';

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const avatarStorage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        await fs.mkdir(AVATAR_BASE_PATH, { recursive: true });
        cb(null, AVATAR_BASE_PATH);
    },
    filename: getRandomFilename
});

/* ---------------------------------------------------------- */
/*                          Category                          */
/* ---------------------------------------------------------- */
export const categoryStorage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        await fs.mkdir(CATEGORY_BASE_PATH, { recursive: true });
        cb(null, CATEGORY_BASE_PATH);
    },
    filename: getRandomFilename
});

/* ---------------------------------------------------------- */
/*                             SPU                            */
/* ---------------------------------------------------------- */
export const spuStorage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        await fs.mkdir(SPU_BASE_PATH, { recursive: true });
        cb(null, SPU_BASE_PATH);
    },
    filename: getRandomFilename
});

export const categoryMedia: Array<model.media.MediaSchema> = [
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000000'),
        media_title: 'Đồ điện tử',
        media_fileName: 'gadgets.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [
            new mongoose.Types.ObjectId('000000000000000000000001'), // Điện thoại
            new mongoose.Types.ObjectId('000000000000000000000002'), // Laptop
            new mongoose.Types.ObjectId('000000000000000000000003'), // Phụ kiện
            new mongoose.Types.ObjectId('000000000000000000000004') // Máy tính bảng
        ],
        media_desc: 'Example media 1',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000001'),
        media_title: 'Điện thoại',
        media_fileName: 'iphone.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 2',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000002'),
        media_title: 'Laptop',
        media_fileName: 'laptop.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 3',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000003'),
        media_title: 'Phụ kiện',
        media_fileName: 'electronic-devices.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [
            new mongoose.Types.ObjectId('000000000000000000000005'), // Sạc
            new mongoose.Types.ObjectId('000000000000000000000006'), // Cáp
            new mongoose.Types.ObjectId('000000000000000000000007'), // Tai nghe
            new mongoose.Types.ObjectId('000000000000000000000008') // Bàn phím
        ],
        media_desc: 'Example media 4',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000004'),
        media_title: 'Máy tính bảng',
        media_fileName: 'ipad.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 5',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000005'),
        media_title: 'Sạc',
        media_fileName: 'phone-charger.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 6',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000006'),
        media_title: 'Cáp',
        media_fileName: 'cable.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 7',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000007'),
        media_title: 'Tai nghe',
        media_fileName: 'headphones.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 8',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000008'),
        media_title: 'Bàn phím',
        media_fileName: 'keyboard.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 9',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000009'),
        media_title: 'Đồ gia dụng',
        media_fileName: 'household.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [
            new mongoose.Types.ObjectId('00000000000000000000000a'), // Tivi
            new mongoose.Types.ObjectId('00000000000000000000000b'), // Tủ lạnh
            new mongoose.Types.ObjectId('00000000000000000000000c') // Máy lạnh
        ],
        media_desc: 'Example media 10',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000a'),
        media_title: 'Tivi',
        media_fileName: 'television.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 11',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000b'),
        media_title: 'Tủ lạnh',
        media_fileName: 'fridge.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 12',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000c'),
        media_title: 'Máy lạnh',
        media_fileName: 'air-conditioner.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 13',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000d'),
        media_title: 'Đồ nội thất',
        media_fileName: 'living-room.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [
            new mongoose.Types.ObjectId('00000000000000000000000e'), // Ghế
            new mongoose.Types.ObjectId('00000000000000000000000f'), // Bàn
            new mongoose.Types.ObjectId('000000000000000000000010') // Sofa
        ],
        media_desc: 'Example media 14',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000e'),
        media_title: 'Ghế',
        media_fileName: 'chair.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 15',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('00000000000000000000000f'),
        media_title: 'Bàn',
        media_fileName: 'table.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 16',
        media_isFolder: false
    },
    {
        _id: new mongoose.Types.ObjectId('000000000000000000000010'),
        media_title: 'Sofa',
        media_fileName: 'sofa.png',
        get media_filePath() {
            return `${CATEGORY_INIT_BASE_PATH}/${this.media_fileName}`;
        },
        media_fileType: MediaTypes.IMAGE,
        media_fileSize: 123456,
        media_mimeType: MediaMimeTypes.IMAGE_PNG,
        media_childrenList: [],
        media_desc: 'Example media 17',
        media_isFolder: false
    }
];
