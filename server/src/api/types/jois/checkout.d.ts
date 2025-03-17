import '';

declare global {
    namespace joiTypes {
        namespace checkout {
            interface Checkout extends Omit<serviceTypes.checkout.arguments.Checkout, 'user'> {}
        }
    }
}
