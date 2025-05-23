export enum MediaTypes {
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    DOCUMENT = 'document',
    OTHER = 'other'
}

export enum MediaExtensions {
    /* ------------------------- Images ------------------------- */
    IMAGE_JPEG = 'jpeg',
    IMAGE_JPG = 'jpg',
    IMAGE_PNG = 'png',
    IMAGE_GIF = 'gif',
    IMAGE_BMP = 'bmp',
    IMAGE_WEBP = 'webp',
    IMAGE_SVG = 'svg',
    IMAGE_TIFF = 'tiff',
    IMAGE_ICO = 'ico',

    /* ------------------------- Video  ------------------------- */
    VIDEO_MP4 = 'mp4',
    VIDEO_WEBM = 'webm',
    VIDEO_OGG = 'ogg',
    VIDEO_FLV = 'flv',

    /* ------------------------- Audio  ------------------------- */
    AUDIO_MP3 = 'mp3',
    AUDIO_OGG = 'ogg',
    AUDIO_WAV = 'wav',
    AUDIO_FLAC = 'flac',
    AUDIO_AAC = 'aac',
    AUDIO_WMA = 'wma',

    /* ------------------------- Document  ------------------------- */
    DOC_PDF = 'pdf',
    DOC_DOC = 'doc',
    DOC_DOCX = 'docx',
    DOC_XLS = 'xls',
    DOC_XLSX = 'xlsx',
    DOC_PPT = 'ppt',
    DOC_PPTX = 'pptx',
    DOC_TXT = 'txt',
    DOC_CSV = 'csv',
    DOC_HTML = 'html',

    /* ---------------------- Compression  ---------------------- */
    ZIP = 'zip',
    RAR = 'rar',
    TAR = 'tar',
    GZIP = 'gzip',
    BZIP = 'bzip',
    BZIP2 = 'bzip2',
    SEVENZIP = '7z'
}

export enum MediaMimeTypes {
    /* ------------------------- Images ------------------------- */
    IMAGE_JPEG = 'image/jpeg',
    IMAGE_PNG = 'image/png',
    IMAGE_GIF = 'image/gif',
    IMAGE_BMP = 'image/bmp',
    IMAGE_WEBP = 'image/webp',
    IMAGE_SVG = 'image/svg+xml',
    IMAGE_TIFF = 'image/tiff',
    IMAGE_ICO = 'image/x-icon',

    /* ------------------------- Video  ------------------------- */
    VIDEO_MP4 = 'video/mp4',
    VIDEO_WEBM = 'video/webm',
    VIDEO_OGG = 'video/ogg',
    VIDEO_FLV = 'video/x-flv',

    /* ------------------------- Audio  ------------------------- */
    AUDIO_MP3 = 'audio/mpeg',
    AUDIO_OGG = 'audio/ogg',
    AUDIO_WAV = 'audio/wav',
    AUDIO_FLAC = 'audio/flac',
    AUDIO_AAC = 'audio/aac',
    AUDIO_WMA = 'audio/x-ms-wma',

    /* ------------------------- Document  ------------------------- */
    DOC_PDF = 'application/pdf',
    DOC_DOC = 'application/msword',
    DOC_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC_XLS = 'application/vnd.ms-excel',
    DOC_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    DOC_PPT = 'application/vnd.ms-powerpoint',
    DOC_PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    DOC_TXT = 'text/plain',
    DOC_CSV = 'text/csv',
    DOC_HTML = 'text/html',

    /* ---------------------- Compression  ---------------------- */
    ZIP = 'application/zip',
    RAR = 'application/x-rar-compressed',
    TAR = 'application/x-tar',
    GZIP = 'application/gzip',
    BZIP = 'application/x-bzip',
    BZIP2 = 'application/x-bzip2',
    SEVENZIP = 'application/x-7z-compressed'
}

/* ---------------------------------------------------------- */
/*                        Avatar field                        */
/* ---------------------------------------------------------- */
export enum AvatarFields {
    AVATAR = 'avatar',
    SHOP_LOGO = 'shop_logo'
}
