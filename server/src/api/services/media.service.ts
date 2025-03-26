import path from 'path';
import multer from 'multer';
import fs from 'fs/promises';

export default new (class MediaService {
    uploadMemory = multer({
        storage: multer.memoryStorage()
    });

    async uploadMedia({
        buffer,
        media_filePath,
        media_fileName
    }: service.media.arguments.UploadMedia) {
        const publicPath = path.join(import.meta.dirname, '../../../public');
        const mediaPath = path.join(publicPath, media_filePath);
        const filePath = path.join(mediaPath, media_fileName);

        /* --------------- Check folder is not exists --------------- */
        if (!(await fs.exists(mediaPath))) await fs.mkdir(mediaPath, { recursive: true });

        /* ---------------------- Write buffer ---------------------- */
        await fs.writeFile(filePath, buffer);
    }
})();
