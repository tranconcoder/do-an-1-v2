import type mongoose from 'mongoose';

declare global {
    namespace model {
        namespace address {
            type AddressSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    user: mongoose.Types.ObjectId;
                    recipient_name: string;
                    recipient_phone: string;
                    location: mongoose.Types.ObjectId;
                    address_label?: string;
                    is_default: boolean;
                    is_active: boolean;
                },
                isModel,
                isDoc,
                {
                    _id: string;
                }
            >;
        }
    }
} 