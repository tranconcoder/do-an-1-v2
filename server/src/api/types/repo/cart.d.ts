import '';

declare global {
    namespace repoTypes {
        namespace cart {
            interface FindAndRemoveProductFromCart {
                product: string;
                user: string;
            }
        }
    }
}
