import "";

declare global {
    namespace model {
        namespace media {
            interface MediaSchema {
                media_title: string;
                media_desc: string;

                media_fileName: string;
                media_filePath: string;
                media_fileType: string;
                media_fileSize: number;
            }
        }
    }
}
