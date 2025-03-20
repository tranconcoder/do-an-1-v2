import type { CategoryEnum } from '@/enums/product.enum.js';

declare global {
    namespace serviceTypes {
        namespace product {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition {
                interface Product
                    extends Partial<modelTypes.product.ProductSchema>,
                        Partial<
                            Pick<
                                joiTypes.product.definition.UpdateProductSchema,
                                'product_new_category'
                            >
                        > {
                    product_attributes?: modelTypes.product.ProductSchemaList;
                }
            }

            /* ------------------------------------------------------ */
            /*                   Function arguments                   */
            /* ------------------------------------------------------ */
            namespace arguments {
                /* ------------------------------------------------------ */
                /*                         Create                         */
                /* ------------------------------------------------------ */
                interface CreateProduct extends definition.Product {}

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

                /* --------------- Get all product by shop -------------- */
                interface GetAllProductByShop
                    extends Pick<modelTypes.product.ProductSchema, 'product_shop'>,
                        Pick<moduleTypes.mongoose.FindAllWithPageSlittingArgs, 'limit' | 'page'> {
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
                        Pick<modelTypes.product.ProductSchema, 'product_shop'> {
                    product_attributes: modelTypes.product.ProductSchemaList;
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
