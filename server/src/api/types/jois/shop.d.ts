import '';

declare global {
    namespace joiTypes {
        namespace shop {
            interface ApproveShop {
                shopId: string;
            }

            interface RejectShop extends ApproveShop {}
        }
    }
}
