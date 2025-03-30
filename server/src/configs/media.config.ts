import bytes from 'bytes';
import path from 'path';

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const AVATAR_MAX_SIZE = bytes.parse('5MB') || 5 * 1024 * 1024;

export const AVATAR_BASE_PATH = path.join(import.meta.dirname, '../../public/avatars');

/* ---------------------------------------------------------- */
/*                          Category                          */
/* ---------------------------------------------------------- */

export const CATEGORY_BASE_PATH = path.join(import.meta.dirname, '../../public/categories');
