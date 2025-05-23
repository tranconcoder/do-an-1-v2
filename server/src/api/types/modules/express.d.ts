declare namespace Express {
    export interface Request {
        userId?: string;
        role?: string;
        mediaId?: string;
        mediaIds?: commonTypes.object.ObjectAnyKeys<Array<string>>;
    }
}
