import userController from '@/controllers/user.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { uploadSingleMedia, cleanUpMediaOnError } from '@/middlewares/media.middleware.js';
import { uploadAvatar } from '@/middlewares/multer.middleware.js';
import { AvatarFields } from '@/enums/media.enum.js';
import { Router } from 'express';

const postRoute = Router();

postRoute.post(
    '/upload-avatar',
    authenticate,
    uploadSingleMedia(AvatarFields.AVATAR, uploadAvatar, 'avatar'),
    catchError(userController.uploadAvatar),
    cleanUpMediaOnError
);

export default postRoute;
