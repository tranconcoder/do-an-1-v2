import type { CategoryEnum } from '@/enums/spu.enum.ts';

declare global {
    namespace service {
        namespace spu {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {}

            /* ------------------------------------------------------ */
            /*                   Function arguments                   */
            /* ------------------------------------------------------ */
            namespace arguments {
                /* ------------------------------------------------------ */
                /*                         Create                         */
                /* ------------------------------------------------------ */
                interface CreateSPU
                    extends Pick<
                        model.spu.SPUSchema,
                        | 'product_name'
                        | 'product_shop'
                        | 'product_description'
                        | 'product_category'
                        | 'product_attributes'
                        | 'product_variations'
                        | 'product_thumb'
                        | 'product_images'
                        | 'is_draft'
                        | 'is_publish'
                    > {
                    sku_list: Omit<service.sku.arguments.CreateSKU, 'sku_product'>[];
                    sku_images_map: Array<number>;
                    mediaIds: commonTypes.object.ObjectAnyKeys<Array<string>>;
                }

                /* ------------------------------------------------------ */
                /*                         Search                         */
                /* ------------------------------------------------------ */
                interface SearchProduct extends joiTypes.product.definition.SearchProductSchema {}

                /* ------------------------------------------------------ */
                /*                          Get                           */
                /* ------------------------------------------------------ */
                interface GetProductWithSlug {
                    slug: string;
                }

                /* ---------------------------------------------------------- */
                /*                          Get all                           */
                /* ---------------------------------------------------------- */
                /* -------------------- Get all products -------------------- */
                interface GetAllSPUOwnByShop extends commonTypes.object.Pagination {
                    userId: string;
                }

                /* --------------- Get all product by shop -------------- */
                interface GetAllProductByShop
                    extends Pick<model.spu.SPUSchema, 'product_shop'>,
                        commonTypes.object.Pagination {
                    userId: string;
                }

                interface GetAllProductDraftByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductPublishByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductUndraftByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductUnpublishByShop
                    extends Omit<GetAllProductByShop, 'userId'> {}

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */
                interface PublishSPU {
                    spuId: string;
                    userId: string;
                }
                interface DraftSPU extends PublishSPU {}

                /* --------------------- Update product --------------------- */
                interface UpdateProduct
                    extends joiTypes.product.definition.UpdateProductSchema,
                        Pick<model.spu.SPUSchema, 'product_shop'> {
                    product_attributes: model.spu.ProductSchemaList;
                }

                interface SetDraftProduct
                    extends joiTypes.product.definition.SetDraftProductSchema {
                    product_shop: string;
                }

                interface SetPublishProduct extends SetDraftProduct {}

                /* ------------------- Remove product ------------------- */
                type RemoveProduct = joiTypes.product.definition.DeleteProductSchema['product_id'];
            }
        }
    }
}
