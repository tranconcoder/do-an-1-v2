declare namespace Express {
    export interface Request {
        userId?: string;
        role?: string;
        mediaId?: string;
        mediaIds?: Array<string>;
    }
}
