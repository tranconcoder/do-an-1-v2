import type { CategoryEnum } from '@/enums/spu.enum.ts';
import type { CreateSPU as CreateSPUZod } from '@/validations/zod/spu.zod.js';

declare global {
    namespace service {
        namespace spu {
            /* ====================================================== */
            /*                       DEFINITION                       */
            /* ====================================================== */
            namespace definition { }

            /* ------------------------------------------------------ */
            /*                   Function arguments                   */
            /* ------------------------------------------------------ */
            namespace arguments {
                /* ------------------------------------------------------ */
                /*                         Create                         */
                /* ------------------------------------------------------ */
                interface CreateSPU extends CreateSPUZod {
                    sku_list: Omit<service.sku.arguments.CreateSKU, 'sku_product'>[];
                    sku_images_map: Array<number>;
                    mediaIds: commonTypes.object.ObjectAnyKeys<Array<string>>;
                    product_shop: string;
                }

                /* ------------------------------------------------------ */
                /*                         Search                         */
                /* ------------------------------------------------------ */
                interface SearchProduct extends joiTypes.product.definition.SearchProductSchema { }

                /* ------------------------------------------------------ */
                /*                          Get                           */
                /* ------------------------------------------------------ */
                interface GetProductWithSlug {
                    slug: string;
                }

                /* ----------------------- Get SPU by ID ---------------------- */
                interface GetSPUById {
                    spuId: string;
                    userId: string;
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

                interface GetAllProductDraftByShop extends Omit<GetAllProductByShop, 'userId'> { }

                interface GetAllProductPublishByShop extends Omit<GetAllProductByShop, 'userId'> { }

                interface GetAllProductUndraftByShop extends Omit<GetAllProductByShop, 'userId'> { }

                interface GetAllProductUnpublishByShop
                    extends Omit<GetAllProductByShop, 'userId'> { }

                /* ---------------------------------------------------------- */
                /*                           Update                           */
                /* ---------------------------------------------------------- */
                interface PublishSPU {
                    spuId: string;
                    userId: string;
                }
                interface DraftSPU extends PublishSPU { }



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

                interface SetPublishProduct extends SetDraftProduct { }

                /* ------------------- Remove product ------------------- */
                type RemoveProduct = joiTypes.product.definition.DeleteProductSchema['product_id'];
            }
        }
    }
}
