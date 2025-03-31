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
                        | 'product_cost'
                        | 'product_shop'
                        | 'product_quantity'
                        | 'product_description'
                        | 'product_category'
                        | 'product_attributes'
                        | 'product_variations'
                        | 'product_thumb'
                        | 'product_images'
                        | 'is_draft'
                        | 'is_publish'
                    > {
                    sku_list: Omit<service.sku.CreateSKU, 'sku_product'>[];
                }

                /* ------------------------------------------------------ */
                /*                         Search                         */
                /* ------------------------------------------------------ */
                interface SearchProduct extends joiTypes.product.definition.SearchProductSchema {}

                /* ------------------------------------------------------ */
                /*                          Get                           */
                /* ------------------------------------------------------ */
                /* ----------------- Get product by id  ----------------- */
                interface GetProductById {
                    productId: string;
                    userId?: string;
                }

                /* ---------------------------------------------------------- */
                /*                          Get all                           */
                /* ---------------------------------------------------------- */
                /* -------------------- Get all products -------------------- */
                interface GetAllProducts extends commonTypes.object.PageSlitting {}

                /* --------------- Get all product by shop -------------- */
                interface GetAllProductByShop
                    extends Pick<model.spu.SPUSchema, 'product_shop'>,
                        commonTypes.object.PageSlitting {
                    userId: string;
                }

                interface GetAllProductDraftByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductPublishByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductUndraftByShop extends Omit<GetAllProductByShop, 'userId'> {}

                interface GetAllProductUnpublishByShop
                    extends Omit<GetAllProductByShop, 'userId'> {}

                /* ------------------- Update product ------------------- */
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
