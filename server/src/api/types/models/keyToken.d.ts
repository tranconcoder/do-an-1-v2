import keyTokenModel from '../../models/keyToken.model';

declare global {
    namespace modelTypes {
        namespace keyToken {
            interface KeyTokenSchema {
                user: mongoose.Types.ObjectId;
                private_key: string;
                public_key: string;
                refresh_token: string;
                refresh_tokens_used: string[];
            }
        }
    }
}
