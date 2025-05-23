import '';

declare global {
    namespace joiTypes {
        namespace checkout {
            interface Checkout extends Omit<service.checkout.arguments.Checkout, 'user'> {}
        }
    }
}
