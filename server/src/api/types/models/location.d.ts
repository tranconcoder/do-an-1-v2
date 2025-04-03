import type { ProvinceType, DistrictType, WardType } from '@/enums/location.enum.js';

declare global {
    namespace model {
        namespace location {
            interface CommonTypes {
                _id: string;
            }

            /* ---------------------------------------------------------- */
            /*                          Province                          */
            /* ---------------------------------------------------------- */
            type Province<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<{
                province_name: string;
                province_type: ProvinceType;
                province_slug: string;
            }>;

            /* ---------------------------------------------------------- */
            /*                            District                            */
            /* ---------------------------------------------------------- */
            type District<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    province: moduleTypes.mongoose.ObjectId;
                    district_name: string;
                    district_type: DistrictType;
                    district_slug: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            /* ---------------------------------------------------------- */
            /*                          Ward                          */
            /* ---------------------------------------------------------- */
            type Ward<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    province: moduleTypes.mongoose.ObjectId;
                    district: moduleTypes.mongoose.ObjectId;
                    ward_name: string;
                    ward_type: WardType;
                    ward_slug: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            type LocationSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    province: moduleTypes.mongoose.ObjectId;
                    district: moduleTypes.mongoose.ObjectId;
                    ward?: moduleTypes.mongoose.ObjectId;
                    address: string;
                    text: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            interface LocationSource {
                province: string;
                district: string;
                ward?: string;
                address: string;
            }
        }
    }
}
