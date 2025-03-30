import mediaModel from '@/models/media.model.js';
import {
    findMediaById,
    findOneAndUpdateMedia,
    findOneMedia
} from '@/models/repository/media/index.js';
import { NotFoundErrorResponse } from '@/response/error.response.js';
import { createMedia } from '@/validations/joi/media.joi.js';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import mongoose from 'mongoose';
import { CATEGORY_BASE_PATH } from '@/configs/media.config.js';

export default new (class MediaService {
    /* ---------------------------------------------------------- */
    /*                           Create                           */
    /* ---------------------------------------------------------- */
    async initMedia() {
        const categoryMedia: Array<model.media.MediaSchema> = [
            {
                _id: new mongoose.Types.ObjectId('000000000000000000000000'),
                media_title: 'Đồ điện tử',
                media_fileName: 'gadgets.png',
                get media_filePath() {
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
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
                    return `${CATEGORY_BASE_PATH}/${this.media_fileName}`;
                },
                media_fileType: MediaTypes.IMAGE,
                media_fileSize: 123456,
                media_mimeType: MediaMimeTypes.IMAGE_PNG,
                media_childrenList: [],
                media_desc: 'Example media 17',
                media_isFolder: false
            }
        ];

        /* ------------------------- Insert ------------------------- */
        await Promise.all(
            categoryMedia.map((media) =>
                mediaModel.findOneAndReplace({ _id: media._id }, media, {
                    upsert: true,
                    lean: true,
                    new: true
                })
            )
        );
    }

    async createMedia(payload: service.media.arguments.CreateMedia) {
        /* ---------------------- Validate joi ---------------------- */
        const validated = await createMedia.validateAsync(payload);

        return await mediaModel.create(validated);
    }

    /* ---------------------------------------------------------- */
    /*                            Get                             */
    /* ---------------------------------------------------------- */
    async getMediaFile(id: string) {
        const mediaInfo = await findMediaById({ id, options: { lean: true } });
        if (!mediaInfo) throw new NotFoundErrorResponse({ message: 'Not found media!' });

        const mediaFilePath = mediaInfo.media_filePath;
        if (!existsSync(mediaFilePath))
            throw new NotFoundErrorResponse({ message: 'Not found file!' });

        return mediaFilePath;
    }

    /* ---------------------------------------------------------- */
    /*                           Delete                           */
    /* ---------------------------------------------------------- */
    /* ---------------------- Soft delete  ---------------------- */
    async softRemoveMedia(mediaId: string) {
        const REMOVE_LABEL = 'removed_';

        /* -------------------- Check media info -------------------- */
        const result = await findOneAndUpdateMedia({
            query: { _id: mediaId },
            update: [
                {
                    $set: {
                        is_deleted: true,
                        deleted_at: new Date(),
                        media_fileName: { $concat: [REMOVE_LABEL, '$media_fileName'] },
                        media_filePath: {
                            $let: {
                                vars: {
                                    folderDir: { $split: ['$media_filePath', '/'] }
                                },
                                in: {
                                    $concat: [
                                        {
                                            $reduce: {
                                                input: {
                                                    $slice: [
                                                        '$$folderDir',
                                                        0,
                                                        {
                                                            $subtract: [
                                                                { $size: '$$folderDir' },
                                                                1 // Loại bỏ 2 phần tử cuối
                                                            ]
                                                        }
                                                    ]
                                                },
                                                initialValue: '',
                                                in: {
                                                    $concat: [
                                                        '$$value',
                                                        {
                                                            $cond: [
                                                                { $eq: ['$$value', ''] },
                                                                '',
                                                                '/'
                                                            ]
                                                        },
                                                        '$$this'
                                                    ]
                                                }
                                            }
                                        },
                                        '/',
                                        REMOVE_LABEL,
                                        '$media_fileName'
                                    ]
                                }
                            }
                        }
                    }
                }
            ],
            options: { lean: true }
        });

        /* ---------------------- Rename file  ---------------------- */
        const newFileName = REMOVE_LABEL + result.media_fileName;
        const newPath = `${result.media_filePath.split('/').slice(0, -1).join('/')}/${newFileName}`;

        if (existsSync(result.media_filePath)) await fs.rename(result.media_filePath, newPath);
    }

    /* ---------------------- Hard delete  ---------------------- */
    async hardRemoveMedia(mediaId: string) {
        /* -------------------- Check media info -------------------- */
        const mediaInfo = await findOneMedia({ query: { _id: mediaId } });
        if (!mediaInfo) throw new NotFoundErrorResponse({ message: 'Media not found!' });

        /* --------------------- Remove media file ------------------- */
        const filePath = mediaInfo.media_filePath;
        if (existsSync(filePath)) await fs.unlink(filePath);

        /* ---------------------- Remove media info ------------------- */
        return await mediaInfo.deleteOne();
    }

    /* ---------------------------------------------------------- */
    /*                           Upload                           */
    /* ---------------------------------------------------------- */

    /* --------------------- Upload avatar  --------------------- */
})();
