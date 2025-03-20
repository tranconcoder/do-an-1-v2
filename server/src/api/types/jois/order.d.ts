import '';

declare global {
    namespace joiTypes {
        namespace order {
            interface CreateOrder
                extends Omit<serviceTypes.order.arguments.CreateOrder, 'userId'> {}
        }
    }
}
