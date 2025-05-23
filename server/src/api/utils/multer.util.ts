import { DiskStorageOptions } from 'multer';
import { v4 } from 'uuid';

export const generateRandomFilename = (extname: string) => {
    const filName = v4();
    const dotSymbol = extname.startsWith('.') ? '' : '.';

    return `${filName}${dotSymbol}${extname}`;
};

export const getRandomFilename: DiskStorageOptions['filename'] = (req, file, cb) => {
    const extname = file.mimetype.split('/')[1];
    const filename = generateRandomFilename(extname);

    cb(null, filename);
};
