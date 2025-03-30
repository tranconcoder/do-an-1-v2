import type { CategoryEnum } from '@/enums/spu.enum.ts';

declare global {
    module joiTypes {
        module product {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                /* ====================================================== */
                /*                         CREATE                         */
                /* ====================================================== */
                interface CreatePhoneSchema
                    extends moduleTypes.mongoose.ConvertObjectIdToString<
                        Omit<model.spu.PhoneSchema, 'product_shop' | '_id'>
                    > {}

                interface CreateClothesSchema
                    extends moduleTypes.mongoose.ConvertObjectIdToString<
                        Omit<model.spu.ClothesSchema, 'product_shop' | '_id'>
                    > {}

                interface CreateProductSchema
                    extends Omit<
                        model.spu.SPUSchema,
                        | 'product_shop'
                        | 'product_rating_avg'
                        | 'product_slug'
                        | 'product_attributes'
                        | '_id'
                    > {
                    product_attributes: model.spu.ProductUnion;
                }

                /* ====================================================== */
                /*                         SEARCH                         */
                /* ====================================================== */

                /* =================== Search product =================== */
                interface SearchProductSchema {
                    query: string;
                    page: number;
                }

                /* ====================================================== */
                /*                        GET ONE                         */
                /* ====================================================== */
                interface GetProductByIdSchema
                    extends Omit<service.spu.arguments.GetProductById, 'userId'> {}

                /* ====================================================== */
                /*                         GET ALL                        */
                /* ====================================================== */
                interface GetAllProductsSchema extends joiTypes.PageSplitting {}

                interface GetAllProductByShopQuery extends joiTypes.PageSplitting {}
                interface GetAllProductByShopParams {
                    shopId: string;
                }

                interface GetAllProductDraftByShopSchema extends joiTypes.PageSplitting {}

                interface GetAllProductPublishByShopSchema extends joiTypes.PageSplitting {}

                interface GetAllProductUndraftByShopSchema extends joiTypes.PageSplitting {}

                interface GetAllProductUnpublishByShopSchema extends joiTypes.PageSplitting {}

                /* ====================================================== */
                /*                         UPDATE                         */
                /* ====================================================== */
                interface UpdatePhoneSchema
                    extends commonTypes.utils.PartialNested<CreatePhoneSchema> {}

                interface UpdateClothesSchema
                    extends commonTypes.utils.PartialNested<CreateClothesSchema> {}

                interface UpdateProductSchema
                    extends commonTypes.utils.PartialWithout<
                        CreateProductSchema,
                        'product_category'
                    > {
                    product_id: string;
                    product_new_category?: CategoryEnum;
                }

                interface SetDraftProductSchema {
                    product_id: string;
                }

                interface SetPublishProductSchema extends SetDraftProductSchema {}

                /* ====================================================== */
                /*                         DELETE                         */
                /* ====================================================== */
                interface DeleteProductSchema {
                    product_id: string;
                }
            }
        }

        /* ====================================================== */
        /*                        VALIDATE                        */
        /* ====================================================== */
        namespace validate {
            interface ClothesSchemaRequiredKeys
                extends Array<commonTypes.utils.RequiredKeys<product.CreateClothesSchema>> {}
        }
    }
}
