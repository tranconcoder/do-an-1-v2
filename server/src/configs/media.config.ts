import bytes from 'bytes';
import path from 'path';

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const AVATAR_MAX_SIZE = bytes.parse('5MB') as number;

export const AVATAR_BASE_PATH = path.join(import.meta.dirname, '../../public/avatars');

/* ---------------------------------------------------------- */
/*                          Category                          */
/* ---------------------------------------------------------- */

export const CATEGORY_MAX_SIZE = bytes.parse('5MB') as number;
export const CATEGORY_BASE_PATH = path.join(import.meta.dirname, '../../public/categories');
