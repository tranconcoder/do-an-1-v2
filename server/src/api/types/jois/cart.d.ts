import "";


declare global {
    namespace joiTypes {
        namespace cart {
            interface AddToCart extends Pick<serviceTypes.cart.arguments.AddToCart, 'productId'> {}
        }
    }
}
