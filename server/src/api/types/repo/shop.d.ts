import '';

declare global {
    namespace repo {
        namespace shop {
            interface IsExists
                extends Pick<
                    model.shop.ShopSchema,
                    | 'shop_email'
                    | 'shop_name'
                    | 'shop_phoneNumber'
                    | 'shop_certificate'
                    | 'shop_owner_cardID'
                > {}

            interface FindPendingShop<T>
                extends Omit<moduleTypes.mongoose.FindAllWithPageSlittingArgs<T>, 'query'> {}

                interface FindShopByUser
                    extends Omit<moduleTypes.mongoose.FindOne<model.shop.ShopSchema>, 'query'> {
                    userId: string;
                }
        }
    }
}
