import '';

declare global {
    namespace joiTypes {
        namespace category {
            interface CreateCategory
                extends Omit<service.category.arguments.CreateCategory, 'category_icon'> {}

            interface UpdateCategory
                extends Omit<service.category.arguments.UpdateCategory, 'category_icon'> {}
        }
    }
}
