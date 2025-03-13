import '';
import { CategoryEnum } from '../../enums/product.enum';

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
                interface SearchProduct
                    extends joiTypes.product.definition.SearchProductSchema {}

                /* ------------------------------------------------------ */
                /*                          Get                           */
                /* ------------------------------------------------------ */
                /* ----------------- Get product by id  ----------------- */
                interface GetProductById
                    extends joiTypes.product.definition.GetProductByIdSchema {}

                /* --------------- Get all product by shop -------------- */
                interface GetAllProductByShop
                    extends joiTypes.product.definition
                            .GetAllProductByShopSchema,
                        Pick<
                            modelTypes.product.ProductSchema,
                            'product_shop'
                        > {}

                interface GetAllProductDraftByShop
                    extends GetAllProductByShop {}

                interface GetAllProductPublishByShop
                    extends GetAllProductByShop {}

                interface GetAllProductUndraftByShop
                    extends GetAllProductByShop {}

                interface GetAllProductUnpublishByShop
                    extends GetAllProductByShop {}

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
                type RemoveProduct =
                    joiTypes.product.definition.DeleteProductSchema['product_id'];
            }
        }
    }
}
