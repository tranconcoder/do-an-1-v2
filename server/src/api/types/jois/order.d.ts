import '';

declare global {
    namespace joiTypes {
        namespace order {
            interface CreateOrder extends Omit<service.order.arguments.CreateOrder, 'userId'> {}
        }
    }
}
