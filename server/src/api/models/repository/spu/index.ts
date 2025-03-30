import { ITEM_PER_PAGE } from '@/configs/server.config.js';
import ErrorResponse, {
    ForbiddenErrorResponse,
    NotFoundErrorResponse
} from '@/response/error.response.js';
import { generateFindAllPageSplit } from '@/utils/mongoose.util.js';
import { spuModel } from '@/models/spu.model.js';

// Common
export const queryPaginate = async (query: object, page: number) => {
    if (!page || page < 1) throw new NotFoundErrorResponse({ message: 'Current page invalid!' });

    return await spuModel
        .find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * ITEM_PER_PAGE)
        .limit(ITEM_PER_PAGE)
        .lean();
};

export const queryProductByShop = async (
    query: Partial<model.spu.SPUSchema>,
    productShop: string
) => {
    const product = await spuModel.findById(query);
    if (!product) throw new NotFoundErrorResponse({ message: 'Not found product!' });
    if (product.product_shop.toString() !== productShop)
        throw new ForbiddenErrorResponse({ message: 'Product shop is not match!' });

    return product;
};

/* ---------------------------------------------------------- */
/*                           Create                           */
/* ---------------------------------------------------------- */
export const createProduct = async (payload: service.spu.arguments.CreateProduct) => {
    return await spuModel.create(payload);
};

/* ------------------------------------------------------ */
/*                         Search                         */
/* ------------------------------------------------------ */
/* ------------------- Search product ------------------- */
export const searchProduct = async ({ page, query }: service.spu.arguments.SearchProduct) => {
    if (!page || page < 1) throw new NotFoundErrorResponse({ message: 'Current page invalid!' });

    return await spuModel
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
export const findProductById = async ({ productId, userId }: reop.product.FindProductById) => {
    const product = await spuModel.findById(productId, '+is_publish').lean();
    if (!product) throw new NotFoundErrorResponse({ message: 'Not found product!' });

    if (product.is_publish) return product;

    /* ------------ Check is shop when not publish  ------------ */
    if (product.product_shop === userId) return product;

    throw new ForbiddenErrorResponse({ message: 'Not permission to get this product!' });
};

export const findOneProduct = async (payload: Partial<model.spu.SPUSchema>) => {
    return await spuModel.findOne(payload);
};

/* ------------- Find product category by id ------------ */
export const findProductCategoryById = async (id: string) => {
    return await spuModel.findById(id).then((x) => x?.product_category);
};

/* ------------------------------------------------------ */
/*                        Find all                        */
/* ------------------------------------------------------ */
/* -------------------- Find all product -------------------- */
export const findAllProduct = generateFindAllPageSplit<model.spu.SPUSchema<false, true>>(spuModel);

/* ------------ Find all product id as string ------------ */
export const findAllProductId = async (
    payload: reop.product.FindAllProductId<model.spu.SPUSchema>
) => {
    return findAllProduct({
        query: {},
        projection: payload.projection,
        limit: payload.limit,
        omit: payload.omit,
        page: payload.page,
        select: ['id'] as any
    }).then((products) => products.map(({ _id }) => _id.toString()));
};

/* -------------- Find all product by shop -------------- */
export const findAllProductByShop = async ({
    product_shop,
    limit,
    page,
    isOwner
}: reop.product.FindAllProductByShop) => {
    return await findAllProduct({
        query: isOwner ? { product_shop } : { product_shop, is_publish: true },
        options: { sort: 'ctime' },
        limit,
        page,
        omit: ['__v', 'created_at', 'updated_at']
    });
};

/* ------------- Find all product draft by shop ------------- */
export const findAllProductDraftByShop = async ({
    product_shop,
    limit,
    page
}: service.spu.arguments.GetAllProductDraftByShop) => {
    return findAllProduct({
        query: { product_shop, is_draft: true },
        options: { sort: 'ctime' },
        limit,
        page
    });
};

/* ------------ Find all product publish by shop ------------ */
export const findAllProductPublishByShop = async ({
    product_shop,
    page,
    limit
}: service.spu.arguments.GetAllProductPublishByShop) => {
    const query: Partial<model.spu.SPUSchema> = {
        product_shop,
        is_publish: true
    };

    return await findAllProduct({
        query: {
            product_shop,
            is_publish: true
        },
        options: {
            sort: 'ctime'
        },
        limit,
        page
    });
};

/* ------------ Find all product undraft by shop ------------ */
export const findAllProductUndraftByShop = async ({
    product_shop,
    limit,
    page
}: service.spu.arguments.GetAllProductUndraftByShop) => {
    return await findAllProduct({
        query: { product_shop, is_draft: false },
        page,
        limit
    });
};

/* ------------ Find all product unpublish by shop ------------ */
export const findAllProductUnpublishByShop = async ({
    product_shop,
    limit,
    page
}: service.spu.arguments.GetAllProductUnpublishByShop) => {
    return await findAllProduct({
        query: {
            product_shop,
            is_publish: false
        },
        options: { sort: 'ctime' },
        limit,
        page
    });
};

/* ------------- Find product by shop and id ------------ */
export const findProductByShopAndId = async (
    payload: Pick<model.spu.SPUSchema, 'product_shop' | '_id'>
) => {
    return await spuModel.findOne(payload);
};

/* ------------------- Check user is shop ------------------- */
export const checkUserIsShop = async ({ userId }: reop.product.CheckUserIsShop) => {
    return await spuModel.exists({ product_shop: userId });
};

/* ------ Check products is available to apply discount ------ */
export const checkProductsIsAvailableToUse = async ({
    productIds,
    shopId
}: reop.product.CheckProductsIsAvailableToApplyDiscount) => {
    return !(await spuModel.exists({
        _id: { $in: productIds },
        $or: [{ is_publish: false }, { product_shop: { $ne: shopId } }]
    }));
};

/* --------------- Check products is publish  --------------- */
export const checkProductsIsPublish = async ({
    productIds
}: reop.product.CheckProductsIsPublish) => {
    return !(await spuModel.exists({
        _id: { $in: productIds },
        is_publish: false
    }));
};

/* ------------------------------------------------------ */
/*                         Update                         */
/* ------------------------------------------------------ */
/* ----------------- Set draft product  ----------------- */
export const setDraftProduct = async ({
    product_id: _id,
    product_shop
}: service.spu.arguments.SetDraftProduct) => {
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
}: service.spu.arguments.SetPublishProduct) => {
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
    const product = await spuModel.findByIdAndDelete(_id, { new: true });
    if (!product) throw new ErrorResponse({ message: 'Delete product failed!', statusCode: 400 });

    const productChildModel = getProductModel(product.product_category);
    if (!productChildModel) throw new NotFoundErrorResponse({ message: 'Not found product!' });

    const { deletedCount } = await productChildModel.deleteOne({ _id });

    return deletedCount > 0;
};

/* ----------------- Delete one product ----------------- */
export const deleteOneProduct = async (payload: Partial<model.spu.SPUSchema>) => {
    const { deletedCount } = await spuModel.deleteOne(payload);
    return deletedCount;
};
