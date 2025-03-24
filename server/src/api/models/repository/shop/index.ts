import shopModel from "@/models/shop.model.js"

export const isExistsShop = async ({
    shop_certificate,
    shop_email,
    shop_name,
    shop_owner_cardID,
    shop_phoneNumber
}: repo.shop.IsExists) => {
    return await shopModel.exists({
        $or: [
            { shop_certificate },
            { shop_email },
            { shop_name },
            { shop_owner_cardID },
            { shop_phoneNumber }
        ]
    })
}
