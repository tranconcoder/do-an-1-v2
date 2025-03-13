import { getProductModel } from '../../../../configs/product.config';
import { ITEM_PER_PAGE } from '../../../../configs/server.config';
import ErrorResponse, {
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '../../../response/error.response';
import { productModel } from '../../product.model';

// Common
export const queryPaginate = async (query: object, page: number) => {
    if (!page || page < 1)
        throw new NotFoundErrorResponse('Current page invalid!');

    return await productModel
        .find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
        .lean();
};

export const queryProductByShop = async (
    query: Partial<modelTypes.product.ProductSchema>,
    productShop: string
) => {
    const product = await productModel.findById(query);
    if (!product) throw new NotFoundErrorResponse('Not found product!');
    if (product.product_shop.toString() !== productShop)
        throw new ForbiddenErrorResponse('Product shop is not match!');

    return product;
};

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createProduct = async (
    payload: serviceTypes.product.arguments.CreateProduct
) => {
    return await productModel.create(payload);
};

/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
/* ------------------- Search product ------------------- */
export const searchProduct = async ({
    page,
    query
}: serviceTypes.product.arguments.SearchProduct) => {
    if (!page || page < 1)
        throw new NotFoundErrorResponse('Current page invalid!');

    return await productModel
        .find(
            {
                is_publish: true,
                is_draft: false,
                $text: { $search: query }
            },
            {
                score: { $meta: 'textScore' }
            }
        )
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE);
};

/* ---------------------------------------------------------- */
/*                          Find one                          */
/* ---------------------------------------------------------- */
/* ----------------- Find product by id ----------------- */
export const findProductById = async (id: string) => {
    const product = await productModel.findById(id);
    if (!product) throw new NotFoundErrorResponse('Not found product!');

    return product;
};

export const findOneProduct = async (
    payload: Partial<modelTypes.product.ProductSchema>
) => {
    return await productModel.findOne(payload);
};

/* ------------- Find product category by id ------------ */
export const findProductCategoryById = async (id: string) => {
    return await findProductById(id).then((x) => x?.product_category);
};

/* ------------------------------------------------------ */
/*                        Find all                        */
/* ------------------------------------------------------ */
/* ------------ Find all product id as string ------------ */
export const findProductIdStrList = async () => {
    return (
        await productModel.aggregate().project({
            _id: { $toString: '$_id' }
        })
    ).map((x: { _id: string }) => x._id);
};

/* -------------- Find all product by shop -------------- */
export const findAllProductByShop = async ({
    currentPage,
    product_shop
}: serviceTypes.product.arguments.GetAllProductByShop) => {
    return queryPaginate({ product_shop }, currentPage);
};

/* ------------- Find all product draft by shop ------------- */
export const findAllProductDraftByShop = async ({
    product_shop,
    currentPage
}: serviceTypes.product.arguments.GetAllProductDraftByShop) => {
    const query: Partial<modelTypes.product.ProductSchema> = {
        product_shop,
        is_draft: true
    };

    return queryPaginate(query, currentPage);
};

/* ------------ Find all product publish by shop ------------ */
export const findAllProductPublishByShop = async ({
    product_shop,
    currentPage
}: serviceTypes.product.arguments.GetAllProductPublishByShop) => {
    const query: Partial<modelTypes.product.ProductSchema> = {
        product_shop,
        is_publish: true
    };

    return queryPaginate(query, currentPage);
};

/* ------------ Find all product undraft by shop ------------ */
export const findAllProductUndraftByShop = async ({
    product_shop,
    currentPage
}: serviceTypes.product.arguments.GetAllProductUndraftByShop) => {
    const query: Partial<modelTypes.product.ProductSchema> = {
        product_shop,
        is_draft: false
    };

    return queryPaginate(query, currentPage);
};

/* ------------ Find all product unpublish by shop ------------ */
export const findAllProductUnpublishByShop = async ({
    product_shop,
    currentPage
}: serviceTypes.product.arguments.GetAllProductUnpublishByShop) => {
    const query: Partial<modelTypes.product.ProductSchema> = {
        product_shop,
        is_publish: false
    };

    return queryPaginate(query, currentPage);
};

/* ------------- Find product by shop and id ------------ */
export const findProductByShopAndId = async (
    payload: Pick<modelTypes.product.ProductSchema, 'product_shop' | '_id'>
) => {
    return await productModel.findOne(payload);
};

/* ------------- Check product list is publish  ------------- */
export const checkProductListIsPublish = async (listId: string[]) => {
    return await productModel.exists({
        _id: { $in: listId },
        is_publish: false
    });
};

/* ------------------------------------------------------ */
/*                         Update                         */
/* ------------------------------------------------------ */
/* ----------------- Set draft product  ----------------- */
export const setDraftProduct = async ({
    product_id: _id,
    product_shop
}: serviceTypes.product.arguments.SetDraftProduct) => {
    /* ------------------ Validate product ------------------ */
    const product = await queryProductByShop({ _id }, product_shop);

    /* ------------------- Handle update  ------------------- */
    product.is_draft = true;
    product.is_publish = false;

    return product === (await product.save());
};

/* ---------------- Set publish product  ---------------- */
export const setPublishProduct = async ({
    product_id: _id,
    product_shop
}: serviceTypes.product.arguments.SetPublishProduct) => {
    const product = await queryProductByShop({ _id }, product_shop);

    product.is_publish = true;
    product.is_draft = false;

    return product === (await product.save());
};

/* ------------------------------------------------------ */
/*                         Delete                         */
/* ------------------------------------------------------ */
/* ---------------- Delete product by id ---------------- */
export const deleteProductById = async (_id: string) => {
    const product = await productModel.findByIdAndDelete(_id, { new: true });
    if (!product) throw new ErrorResponse(400, 'Delete product failed!');

    const productChildModel = getProductModel(product.product_category);
    if (!productChildModel)
        throw new NotFoundErrorResponse('Not found product!');

    const { deletedCount } = await productChildModel.deleteOne({ _id });

    return deletedCount > 0;
};

/* ----------------- Delete one product ----------------- */
export const deleteOneProduct = async (
    payload: Partial<modelTypes.product.ProductSchema>
) => {
    const { deletedCount } = await productModel.deleteOne(payload);
    return deletedCount;
};
