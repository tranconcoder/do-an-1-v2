import type { ProvinceType, CityType, DistrictType } from '@/enums/location.enum.js';

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
            /*                            City                            */
            /* ---------------------------------------------------------- */
            type City<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    province: moduleTypes.mongoose.ObjectId;
                    city_name: string;
                    city_type: CityType;
                    city_slug: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            /* ---------------------------------------------------------- */
            /*                          District                          */
            /* ---------------------------------------------------------- */
            type District<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    province: moduleTypes.mongoose.ObjectId;
                    city: moduleTypes.mongoose.ObjectId;
                    district_name: string;
                    district_type: DistrictType;
                    district_slug: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            type LocationSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    province: moduleTypes.mongoose.ObjectId;
                    city: moduleTypes.mongoose.ObjectId;
                    district: moduleTypes.mongoose.ObjectId;
                    address: string;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}
