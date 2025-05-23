import '';

declare global {
    namespace model {
        namespace category {
            interface CommonFields {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type Category<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    category_name: string;
                    category_slug?: string;
                    category_description?: string;
                    category_parent?: moduleTypes.mongoose.ObjectId;
                    category_level?: number;
                    category_icon: moduleTypes.mongoose.ObjectId;
                    category_order?: number;
                    category_product_count?: number;

                    /* ------------------------ Metadata ------------------------ */
                    is_active?: boolean;
                    is_deleted?: boolean;
                    deleted_at?: Date;
                },
                isModel,
                isDoc,
                CommonFields
            >;
        }
    }
}
